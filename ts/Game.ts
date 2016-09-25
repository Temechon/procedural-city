class Game {

    private engine: BABYLON.Engine;
    public scene: BABYLON.Scene;
    
    private _allTiles : Array<Tile> = [];
    
    public shadows : BABYLON.ShadowGenerator;

    constructor(canvasId: string) {

        let canvas: HTMLCanvasElement = <HTMLCanvasElement>document.getElementById(canvasId);
        this.engine = new BABYLON.Engine(canvas, true);
        this.engine.enableOfflineSupport = false;

        this.scene = null;

        window.addEventListener("resize", () => {
            this.engine.resize();
        });

        this._initScene();
    }

    private _run() {
        this.scene.executeWhenReady(() => {
            
            // Remove loader
            var loader = <HTMLElement> document.querySelector("#loader");
            loader.style.display = "none";

            this._initGame();

            this.engine.runRenderLoop(() => {
                this.scene.render();
            });
        });
    }

    private _initScene() {

        this.scene = new BABYLON.Scene(this.engine);
        this.scene.clearColor = BABYLON.Color3.FromInts(0,163,136);

        let camera = new BABYLON.FreeCamera('', new BABYLON.Vector3(-6, 21, -36), this.scene);
        camera.rotation = new BABYLON.Vector3(0.44,0.73, 0);
        camera.attachControl(this.engine.getRenderingCanvas());
        let light = new BABYLON.HemisphericLight('', new BABYLON.Vector3(0, 1, 0), this.scene);
        light.intensity = 0.4;
        
        let dir = new BABYLON.DirectionalLight('', new BABYLON.Vector3(0.5,-1,0.25), this.scene);
        dir.position.copyFrom(dir.direction.scale(-10));
                
        var shadowGenerator = new BABYLON.ShadowGenerator(2048, dir);
        shadowGenerator.useBlurVarianceShadowMap = true;
        shadowGenerator.setDarkness(0.05);
        shadowGenerator.bias = 0.0001;
        shadowGenerator.blurScale = 2;        
        this.shadows = shadowGenerator;

        let loader = new Preloader(this);
        loader.callback = this._run.bind(this);        
        loader.loadAssets();
        
    }


    private _initGame () {
        // this.scene.debugLayer.show(); 
        
        // Get available tiles
        for (let mesh of this.scene.meshes) {
            if (mesh.name.substr(0,1) == '0' || mesh.name.substr(0,1) == '1' ){
                let tile = new Tile(mesh.name);
                this._allTiles.push(tile);
                this._allTiles.push(tile.rotatedCopy(1));
                this._allTiles.push(tile.rotatedCopy(2)); 
                this._allTiles.push(tile.rotatedCopy(3));
            }
        }
        
        // Create base building
        let baseBuilding = BABYLON.MeshBuilder.CreateBox('baseBuilding', {size:0.5}, this.scene);
        let buildingMat = new BABYLON.StandardMaterial('baseBuildingMat', this.scene);
        buildingMat.diffuseColor = BABYLON.Color3.White(); 
        buildingMat.specularColor = BABYLON.Color3.Black();
        baseBuilding.material = buildingMat;
        baseBuilding.setEnabled(false);
                
        // Build city
        let len = 30;
        let city = [];
        
        var timers = [];
        var delay = 0;
                
        for (let j=0; j<len; j++) {   
            city[j] = [];
            for (let i = 0; i < len; i++) {
                let timer = new Timer(delay, this.scene, {autodestroy:true});
                timer.callback = () => {
                    let sel = this.findNextTile(i, j, city);
                    
                    sel.pos.x = i*3;
                    sel.pos.z = -j*3;
                    sel.draw(this.createAsset(sel.name, Game.CLONE, sel.toString()), this);
                    city[j][i] = sel;     
                };
                timers.push(timer);
                delay += 150;                
            }
        }   
        
        for (let t of timers) {
            t.start();
        }  
    }
    
    // i -> line
    // j -> line
    private findNextTile(i:number, j:number, city:Array<Array<Tile>>) {        
        // Get last tile of the city
        let previousLine = null, topTile = null, leftTile = null;
        if (j>0){
            previousLine = city[j-1];  
            topTile = city[j-1][i]; 
        } 
        if (i>0) {       
            leftTile = city[j][i-1];
        }
        
        // random sort tiles
        this._shuffle(this._allTiles);
        return this._findMatchingTile(topTile, Tile.BOT, leftTile, Tile.RIGHT);                
    }
    
    private _findMatchingTile(tile:Tile, face:number, tile2:Tile, face2:number) {
        for (var i = 0; i < this._allTiles.length; i++) {
            if (this._allTiles[i].canBe2(face, tile, face2, tile2)) {
                return this._allTiles[i];                
            }
        }
    }
    
    public static SELF : number = 0;
    public static CLONE : number = 1;
    public static INSTANCE : number = 2;
    
    public createAsset(name:string, mode:number=Game.SELF, newName:string='') : BABYLON.Mesh {
        let mesh : BABYLON.Mesh = <BABYLON.Mesh> this.scene.getMeshByName(name);
        let res = null;
        switch (mode) {
            case Game.SELF:
                res = mesh;
                mesh.setEnabled(true);
                break;
            case Game.CLONE:
                res = mesh.clone(newName);
                break;
                
            case Game.INSTANCE:
                res = mesh.createInstance(newName);
                break;
        }
        return res;
    }
    
    
    private _shuffle(array) {
		var currentIndex = array.length, temporaryValue, randomIndex;
		
		// While there remain elements to shuffle...
		while (0 !== currentIndex) {		
            // Pick a remaining element...
            randomIndex = Math.floor(Math.random() * currentIndex);
            currentIndex -= 1;
            
            // And swap it with the current element.
            temporaryValue = array[currentIndex];
            array[currentIndex] = array[randomIndex];
            array[randomIndex] = temporaryValue;
		}
		
		return array;
	}
    
    
}
