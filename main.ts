import { Plugin, WorkspaceLeaf, TFile } from 'obsidian';
import { PropertiesFilterView } from './PropertiesFilterView';

export default class PropertiesFilterPlugin extends Plugin {
  
  private static instance: PropertiesFilterPlugin | null = null;

  async onload() {
    console.log("PropertiesFilter plugin loaded");

    if (PropertiesFilterPlugin.instance) {
      console.warn("PropertiesFilter is already loaded!");
      return; 
    }  
    PropertiesFilterPlugin.instance = this;

    // Enregistrer la vue pour le plugin
    this.registerView(
      PropertiesFilterView.VIEW_TYPE_PROPERTIES_FILTER,
      (leaf: WorkspaceLeaf) => new PropertiesFilterView(leaf)
    );

    console.log("Vue enregistrée:", PropertiesFilterView.VIEW_TYPE_PROPERTIES_FILTER);

    // Rafraîchir la vue après la création d'un fichier ou à l'ouverture
    this.app.workspace.on("file-open", async (file: TFile) => {
      await this.refreshView();
    });

// Écouter les modifications de fichier
    this.app.vault.on("modify", async (file: TFile) => {
      console.log("Fichier modifié :", file.path);

      // Rafraîchir la vue uniquement si les propriétés sont modifiées
      await this.refreshView();
    });

    // Ajouter un bouton dans le ribbon
    this.addRibbonIcon('filter', 'Open Properties Filter', async () => {
      const { workspace } = this.app;
      const existingLeaf = workspace.getLeavesOfType(PropertiesFilterView.VIEW_TYPE_PROPERTIES_FILTER)[0];

      if (!existingLeaf) {
        // Ouvrir la vue si elle n'est pas déjà ouverte
        await this.activateView();
      } else {
        // Si la vue est déjà ouverte, la rafraîchir
        await this.refreshView();
      }
    });
  }

  async refreshView() {
    const { workspace } = this.app;

    // Récupérer la feuille existante
    const existingLeaf = workspace.getLeavesOfType(PropertiesFilterView.VIEW_TYPE_PROPERTIES_FILTER)[0];

    if (existingLeaf) {
      // Fermer la feuille actuelle en la détachant
//      workspace.detachLeaf(existingLeaf); // Cette méthode déconnecte la vue de l'espace de travail
//        this.app.workspace.detachLeavesOfType(PropertiesFilterView.VIEW_TYPE_PROPERTIES_FILTER);
        existingLeaf.detach();
    }  

    // Créer et afficher une nouvelle feuille pour la vue
    const newLeaf = workspace.getLeftLeaf(false)!;
    await newLeaf.setViewState({
      type: PropertiesFilterView.VIEW_TYPE_PROPERTIES_FILTER,
      active: false
    });

    workspace.revealLeaf(newLeaf);  // Révéler la nouvelle feuille
  }

  async activateView() {
    const { workspace } = this.app;

    let leaf = workspace.getLeavesOfType(PropertiesFilterView.VIEW_TYPE_PROPERTIES_FILTER)[0];

    if (!leaf) {
      leaf = workspace.getLeftLeaf(false)!;
      await leaf.setViewState({
        type: PropertiesFilterView.VIEW_TYPE_PROPERTIES_FILTER,
        active: true
      });
    }

    workspace.revealLeaf(leaf);
  }

  onunload() {
    console.log("PropertiesFilter plugin unloaded");
    PropertiesFilterPlugin.instance = null;
  }
}

