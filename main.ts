import { Plugin, WorkspaceLeaf } from 'obsidian';
import { PropertiesFilterView } from './PropertiesFilterView';

// mettre une option pour savoir si on l'integre dans le filetree direct (un, ou les deux)'

export default class PropertiesFilterPlugin extends Plugin {
  
  private static instance: PropertiesFilterPlugin | null = null;

  
  async onload() {
    console.log("PropertiesFilter 2plugin loaded");

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

    console.log("Vue enregistrée 2:", PropertiesFilterView.VIEW_TYPE_PROPERTIES_FILTER);
     await this.activateView();

   /* // Ajouter un bouton dans le ribbon
    this.addRibbonIcon('filter', 'PropertiesFilter', async () => {
      // Ouvrir la vue dans le panneau de gauche
      await this.activateView();
    }); 
*/ 
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

