import { ItemView, WorkspaceLeaf, TFile } from 'obsidian';



export class PropertiesFilterView extends ItemView {

    public static VIEW_TYPE_PROPERTIES_FILTER = 'propertiesfilterelekis';


  constructor(leaf: WorkspaceLeaf) {
    super(leaf);
  }
 

  getViewType(): string {
    return PropertiesFilterView.VIEW_TYPE_PROPERTIES_FILTER;
  }

  getDisplayText(): string {
    return 'Properties Filter Plugin';
  }

  getIcon(): string {
    return "filter"; 
}


  async onOpen() {


    const container = this.containerEl;
    const windowContainer = container.createDiv({ cls: 'properties-filter-elekis-container' });

    // Fenêtre 1 : Propriétés de tous les fichiers
    const window1 = windowContainer.createDiv({ cls: 'properties-filter-elekis-window1' });
    const buttondiv = window1.createEl('div', { cls: 'properties-filter-elekis-add-line' });
    const filterdiv = window1.createEl('div', { cls: 'properties-filter-elekis-filtered' });
    const buttonContainer = buttondiv.createDiv({ cls: 'properties-filter-elekis-button-container' });

    const selectElement         = buttonContainer.createEl('select', { cls: 'properties-filter-elekis-select' });
    const valueElement          = buttonContainer.createEl('select', { cls: 'properties-filter-elekis-select' });
    const addFilterButton       = buttonContainer.createEl('button', { text: '+', cls: 'properties-filter-elekis-button-add' });
    const addResetButton        = buttonContainer.createEl('button', { text: 'R', cls: 'properties-filter-elekis-button-reset' });

    selectElement.createEl('option', { text: 'all', value: 'all' });
    valueElement.createEl('option', { text: 'all', value: 'all' });

    let userFilter = [{ key: 'all', value: 'all'}]  //les filtres actifs.
    let fileFiltered: TFile[] = []  // visible dans windows 2
    let fileMetadata: { [filePath: string]: any } = {};
    let keyValuesMap: { [key: string]: string[] } = {};
    fileFiltered = this.app.vault.getFiles();
    

    const getmetadataFile = (files: TFile[]) => {   
        const allKeys: string[] = ['all'];
        selectElement.empty()
        // Récupérer toutes les propriétés et valeurs dans les fichiers
        files.forEach((file: TFile) => {
            const metadata = this.app.metadataCache.getFileCache(file);
            if (metadata?.frontmatter) {
                for (const [key, value] of Object.entries(metadata.frontmatter)) {
                    if (!allKeys.includes(key)) allKeys.push(key);
                    if (!keyValuesMap[key]) keyValuesMap[key] = [];
                    if (!keyValuesMap[key].includes(String(value))) keyValuesMap[key].push(String(value));
                }
                fileMetadata[file.path] = metadata.frontmatter;
            }
        });
        const sortedKeys = ['all', ...allKeys.slice(1).sort((a, b) => a.localeCompare(b))];
        sortedKeys.forEach((key) => {
            selectElement.createEl('option', { text: String(key), value: String(key) });
      });
    };

      // Mettre à jour les valeurs quand une nouvelle propriété est choisie
      const updateNewValueList = (selectedKey: string) => {

        valueElement.empty();
        valueElement.createEl('option', { text: 'all', value: 'all' });
        
        if (selectedKey =='all'){
                    const allValues = Object.values(keyValuesMap).flat().sort();
                    allValues.forEach( (value) => {  valueElement.createEl('option', { text: value, value: value })}); 
            }else{        
            if (selectedKey && keyValuesMap[selectedKey]) {
              keyValuesMap[selectedKey].forEach((value) => {
                valueElement.createEl('option', { text: value, value: value });
              });
            }
        }
    }; 

    getmetadataFile(fileFiltered);
    updateNewValueList('all');


    addFilterButton.addEventListener('click', () => {
        const properText = selectElement.options[selectElement.selectedIndex].text;
        const valueText = valueElement.options[valueElement.selectedIndex].text;
        const filterdivd        = filterdiv.createEl('div', {cls: 'properties-filter-elekis-divprop' });
        const filterdivt        = filterdivd.createEl('h5', { text: properText+":"+valueText }); 
        const filterdivb        = filterdivd.createEl('button', { text: '-', cls: 'properties-filter-elekis-divprop-button' });
        filterdivd.dataset.key = properText;
        filterdivd.dataset.value = valueText;

        filterdivb.addEventListener('click', () => {
               console.log(userFilter);
               console.log(fileFiltered);
               userFilter = userFilter.filter(filter => !(filter.key === filterdivd.dataset.key && filter.value === filterdivd.dataset.value));
               userFilter.remove({ key: properText, value: valueText}) 
               filterdivd.remove()
               fileFiltered = this.app.vault.getFiles();
               getmetadataFile(fileFiltered);
               updateFileList(userFilter);
               updateAddFilterButtonState();
                });
         userFilter.push({ key: properText, value: valueText})
         updateFileList(userFilter);        
         selectElement.selectedIndex = 0; 
         fileMetadata = {}; 
         keyValuesMap = {};
         getmetadataFile(fileFiltered); 
         updateNewValueList('all');
         updateAddFilterButtonState();
        
    });

    addResetButton.addEventListener('click', () => {
        // Vider le tableau
        filterdiv.empty();
        // Mettre à jour la liste des fichiers après le reset
        userFilter = [{ key: 'all', value: 'all'}]
        fileFiltered = this.app.vault.getFiles();
        fileMetadata = {}; 
        keyValuesMap = {};
        updateFileList(userFilter);
        getmetadataFile(fileFiltered);
        updateNewValueList('all');
        });

  // Event listeners pour les nouvelles lignes de filtres
      selectElement.addEventListener('change', (event) => {
        const selectedKey = (event.target as HTMLSelectElement).value;
        updateNewValueList(selectedKey);
        updateAddFilterButtonState();
      });
 
     valueElement.addEventListener('change', () => {
        updateAddFilterButtonState(); // Met à jour l'état du bouton
        });

    // Fenêtre 2 : Liste des fichiers filtrés
    const window2 = windowContainer.createDiv({ cls: 'properties-filter-elekis-window2' });

    window2.createEl('h2', { text: 'files' });
    const fileList = window2.createEl('ul', { cls: 'properties-filter-elekis-file-list' });


    const updateFileList = (filters: { key: string; value: string }[]) => {
            fileList.empty();

            // Filtrer uniquement les fichiers qui passent tous les filtres
            fileFiltered = fileFiltered.filter((file: TFile) => {
                const metadata = fileMetadata[file.path];

                return filters.every(filter => {
                    if (filter.key === 'all' && filter.value == 'all') return true; // Si "all", ne pas filtrer
                    if (typeof metadata === 'undefined') return false;
                    if (filter.value === 'all' && filter.key in metadata) return true;
                    if (filter.key ==='all' && filter.value !=='all') return Object.values(metadata).some(val => String(val) === filter.value);
                    return String(metadata[filter.key]) === filter.value;
                });
            });


//# clicque sur reset -> rien du tout.
//#filtre ne marche pas quand 'all'

            // Maintenant, fileFiltered ne contient que les fichiers valides
            fileFiltered.forEach((file: TFile) => {
                const fileItem = fileList.createEl('li');
                const fileLink = fileItem.createEl('a', {
                    href: '',
                    text: file.name,
                    cls: 'properties-filter-elekis-file-link',
                });

                // Ouvrir le fichier lors du clic sur un élément de la liste
                fileLink.addEventListener('click', (event) => {
                    event.preventDefault();
                    this.app.workspace.openLinkText(file.path, '', true);
                });
            });
};

    const updateAddFilterButtonState = () => {
        const selectedKey = selectElement.value;
        const selectedValue = valueElement.value;

        if (selectedKey === 'all' && selectedValue === 'all') {
            addFilterButton.disabled = true;
            addFilterButton.style.backgroundColor = 'gray'; // Couleur désactivée
            addFilterButton.style.cursor = 'not-allowed';
        } else {
            addFilterButton.disabled = false;
            addFilterButton.style.backgroundColor = ''; // Réinitialiser la couleur
            addFilterButton.style.cursor = 'pointer';
        }
    };


        // Afficher tous les fichiers au début
    userFilter = [{ key: 'all', value: 'all'}]
    updateFileList(userFilter);
    updateAddFilterButtonState();
    // Styles pour les liens des fichiers
    const fileLinks = fileList.querySelectorAll('.properties-filter-elekis-file-link');
    fileLinks.forEach((link) => {
    });
  }
async onClose(): Promise<void>{
    // Logique pour la fermeture de la vue
  }
}
