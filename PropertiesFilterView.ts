import { ItemView, WorkspaceLeaf, TFile } from 'obsidian';

export class PropertiesFilterView extends ItemView {

    public static VIEW_TYPE_PROPERTIES_FILTER = 'propertiesfilterelekis';
    private userFilter: { key: string; value: string }[] = [{ key: 'all', value: 'all' }];
    private fileFiltered: TFile[] = [];
    private fileMetadata: { [filePath: string]: any } = {};
    private keyValuesMap: { [key: string]: string[] } = {};
    private fileList: HTMLElement;
    private window2 : HTMLElement;
    private selectElement : HTMLSelectElement;
    private valueElement : HTMLSelectElement;

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
        const window1 = windowContainer.createDiv({ cls: 'properties-filter-elekis-window1' });
        const buttondiv = window1.createEl('div', { cls: 'properties-filter-elekis-add-line' });
        const filterdiv = window1.createEl('div', { cls: 'properties-filter-elekis-filtered' });
        const buttonContainer = buttondiv.createDiv({ cls: 'properties-filter-elekis-button-container' });

        this.selectElement = buttonContainer.createEl('select', { cls: 'properties-filter-elekis-select' });
        this.valueElement = buttonContainer.createEl('select', { cls: 'properties-filter-elekis-select' });
        const addFilterButton = buttonContainer.createEl('button', { text: '+', cls: 'properties-filter-elekis-button-add' });
        const addResetButton = buttonContainer.createEl('button', { text: 'R', cls: 'properties-filter-elekis-button-reset' });

        this.selectElement.createEl('option', { text: 'all', value: 'all' });
        this.valueElement.createEl('option', { text: 'all', value: 'all' });

        this.fileFiltered = this.app.vault.getFiles();
        
        this.getmetadataFile();
        this.updateNewValueList('all');

        addFilterButton.addEventListener('click', () => {
            const properText = this.selectElement.options[this.selectElement.selectedIndex].text;
            const valueText = this.valueElement.options[this.valueElement.selectedIndex].text;
            const filterdivd = filterdiv.createEl('div', { cls: 'properties-filter-elekis-divprop' });
            const filterdivt = filterdivd.createEl('h5', { text: properText + ":" + valueText });
            const filterdivb = filterdivd.createEl('button', { text: '-', cls: 'properties-filter-elekis-divprop-button' });
            filterdivd.dataset.key = properText;
            filterdivd.dataset.value = valueText;

            filterdivb.addEventListener('click', () => {
                this.userFilter = this.userFilter.filter(filter => !(filter.key === filterdivd.dataset.key && filter.value === filterdivd.dataset.value));
                this.userFilter.remove({ key: properText, value: valueText}) 
                filterdivd.remove()
                this.fileFiltered = this.app.vault.getFiles();
                this.getmetadataFile();
                this.updateFileList();
                this.updateAddFilterButtonState( addFilterButton);
            });
            console.log("add file");
            this.userFilter.push({ key: properText, value: valueText });
            this.updateFileList();        
            this.selectElement.selectedIndex = 0;
            this.fileMetadata = {};
            this.keyValuesMap = {};
            this.getmetadataFile();
            this.updateNewValueList('all');
            this.updateAddFilterButtonState(addFilterButton);

        });

        addResetButton.addEventListener('click', () => {
            filterdiv.empty();
            this.userFilter = [{ key: 'all', value: 'all' }];
            this.fileFiltered = this.app.vault.getFiles();
            this.fileMetadata = {};
            this.keyValuesMap = {};
            this.getmetadataFile();
            this.updateNewValueList('all');
        });

        this.selectElement.addEventListener('change', (event) => {
            const selectedKey = (event.target as HTMLSelectElement).value;
            this.updateNewValueList(selectedKey);
            this.updateAddFilterButtonState( addFilterButton);
        });

        this.valueElement.addEventListener('change', () => {
            this.updateAddFilterButtonState( addFilterButton);
        });

        this.window2 = windowContainer.createDiv({ cls: 'properties-filter-elekis-window2' });
        this.window2.createEl('h2', { text: 'files' });
        this.fileList = this.window2.createEl('ul', { cls: 'properties-filter-elekis-file-list' });

        this.updateFileList();
        this.updateAddFilterButtonState( addFilterButton);

        this.app.vault.on("create", async (file: TFile) => {
             if (!(file instanceof TFile))return;
             this.fileFiltered.push(file);
             this.updateFileList();
            });

        this.app.vault.on("delete", async (file: TFile) => {
             if (!(file instanceof TFile))return;
              this.fileFiltered = this.fileFiltered.filter(f => f.path !== file.path);
             this.updateFileList();
            });
 
    }
 
    private getmetadataFile(): void {
        const allKeys: string[] = ['all'];
        this.selectElement.empty();

        this.fileFiltered.forEach((file: TFile) => {
            const metadata = this.app.metadataCache.getFileCache(file);
            if (metadata?.frontmatter) {
                for (const [key, value] of Object.entries(metadata.frontmatter)) {
                    if (!allKeys.includes(key)) allKeys.push(key);
                    if (!this.keyValuesMap[key]) this.keyValuesMap[key] = [];
                    if (!this.keyValuesMap[key].includes(String(value))) this.keyValuesMap[key].push(String(value));
                }
                this.fileMetadata[file.path] = metadata.frontmatter;
            }
        });

        const sortedKeys = ['all', ...allKeys.slice(1).sort((a, b) => a.localeCompare(b))];
        sortedKeys.forEach((key) => {
            this.selectElement.createEl('option', { text: String(key), value: String(key) });
        });
    }

    private updateNewValueList(selectedKey: string): void {
        this.valueElement.empty();
        this.valueElement.createEl('option', { text: 'all', value: 'all' });

        if (selectedKey === 'all') {
            const allValues = [...new Set(Object.values(this.keyValuesMap).flat())].sort();
            console.log("fkdj",allValues);
            allValues.forEach((value) => {
                this.valueElement.createEl('option', { text: value, value: value });
            });
        } else {
            if (selectedKey && this.keyValuesMap[selectedKey]) {
                this.keyValuesMap[selectedKey].forEach((value) => {
                    this.valueElement.createEl('option', { text: value, value: value });
                });
            }
        }
    }

    private updateFileList(): void {
        this.fileList.empty();

        this.fileFiltered = this.fileFiltered.filter((file: TFile) => {
            const metadata = this.fileMetadata[file.path];

            return this.userFilter.every(filter => {
                if (filter.key === 'all' && filter.value === 'all') return true;
                if (typeof metadata === 'undefined') return false;
                if (filter.value === 'all' && filter.key in metadata) return true;
                if (filter.key === 'all' && filter.value !== 'all') return Object.values(metadata).some(val => String(val) === filter.value);
                return String(metadata[filter.key]) === filter.value;
            });
        });

        this.fileFiltered.sort((a, b) => a.basename.localeCompare(b.basename));

        this.fileFiltered.forEach((file: TFile) => {
            const fileItem = this.fileList.createEl('li');
            const fileLink = fileItem.createEl('a', {
                href: '',
                text: file.name,
                cls: 'properties-filter-elekis-file-link',
            });

            fileLink.addEventListener('click', (event) => {
                event.preventDefault();
                this.app.workspace.openLinkText(file.path, '', true);
            });
        });
    }

    private updateAddFilterButtonState( addFilterButton: HTMLButtonElement): void {
        const selectedKey = this.selectElement.value;
        const selectedValue = this.valueElement.value;

        if (selectedKey === 'all' && selectedValue === 'all') {
            addFilterButton.disabled = true;
            addFilterButton.style.backgroundColor = 'gray';
            addFilterButton.style.cursor = 'not-allowed';
        } else {
            addFilterButton.disabled = false;
            addFilterButton.style.backgroundColor = '';
            addFilterButton.style.cursor = 'pointer';
        } 
    }



    async onClose(): Promise<void> {
        // Logique pour la fermeture de la vue
    }
}

