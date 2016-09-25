class Preloader {
    
    private _game : Game;
    private _scene : BABYLON.Scene;
    private _loader : BABYLON.AssetsManager = null;
    
    // Function called when the loader is over
    public callback : () => void;
    
    constructor(game:Game) {
        this._game = game;
        this._scene = this._game.scene;
        
        this._loader = new BABYLON.AssetsManager(this._scene);
        this._loader.useDefaultLoadingScreen = false;
        this._loader.onFinish = this._onFinish.bind(this);
              
    }
    
    public loadAssets() {
        
        this._addMesh('tiles');
        this._loader.load();
    }
    
    private _onFinish() {
        this.callback();
    }
    
    private _addMesh(folder :string, name?:string ) {
        if (name) {
            var task = this._loader.addMeshTask(name, '', `assets/${folder}/`, `${name}.babylon`);
        } else {
            var task = this._loader.addMeshTask(folder, '', `assets/${folder}/`, `${folder}.babylon`);
        }
        task.onSuccess = this._addMeshAssetToGame.bind(this);
    }
    
    private _addMeshAssetToGame(t: BABYLON.MeshAssetTask) {

        console.group();
        for (let m of t.loadedMeshes) {
            m.setEnabled(false); 
            console.log(`%c Loaded : ${m.name}`, 'background: #333; color: #bada55');
        }
        console.log(`%c Finished : ${t.name}`, 'background: #333; color: #bada55');
        
        console.groupEnd();
    }
}