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

    this.registerView(
      PropertiesFilterView.VIEW_TYPE_PROPERTIES_FILTER,
      (leaf: WorkspaceLeaf) => new PropertiesFilterView(leaf)
    );

    // Ajouter un bouton dans le ribbon
    this.addRibbonIcon('filter', 'Open Properties Filter', async () => {
      const { workspace } = this.app;
      const existingLeaf = workspace.getLeavesOfType(PropertiesFilterView.VIEW_TYPE_PROPERTIES_FILTER)[0];

      if (!existingLeaf) {
        await this.activateView();
           } 
        });
    
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

    // Trouver la leaf associée à la vue du plugin
    const leaves = this.app.workspace.getLeavesOfType(PropertiesFilterView.VIEW_TYPE_PROPERTIES_FILTER);
    for (const leaf of leaves) {
        leaf.detach(); // Supprime proprement la leaf
    }

    // Réinitialiser l'instance du plugin
    PropertiesFilterPlugin.instance = null;
}

}

