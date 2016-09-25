// 0 1 2
// 3 4 5
// 6 7 8
class Tile {
    
    private _numbers    : Array<number> = [];
    public pos        : BABYLON.Vector3 = new BABYLON.Vector3(0,0,0);
    private _angle      : number = 0;    
    public name         : string;
    
    public static TOP:number = 0;
    public static RIGHT:number = 1;
    public static BOT:number = 2;
    public static LEFT:number = 3;
    
    constructor(name) {
        
        this.name = name;
        
        // Creates numbers
        let tmp = name.split('');
        for (let a in tmp) {
            this._numbers[a] = parseInt(tmp[a], 10);
        }
    }
    
    public toString() : string {
        return this._numbers.toString();
    }
    
    // => top : (0 1 2)
    // => right : (2 5 8)
    // => bot : (6 7 8)
    // => left : (0 3 6)
    public getFace(face:number) : Array<number> {
        let res = [];
        switch (face) {
            case Tile.TOP:
                res = [this._numbers[0], this._numbers[1], this._numbers[2]]
                break;
            case Tile.RIGHT:
                res = [this._numbers[2], this._numbers[5], this._numbers[8]];
                break;
            case Tile.BOT:
                res = [this._numbers[6], this._numbers[7], this._numbers[8]];
                break;
            case Tile.LEFT:
                res = [this._numbers[0], this._numbers[3], this._numbers[6]];
                break;
        }	
        return res;	
    }
    
    
    // 0 : (0,3,6)
    // 1 : (1,4,7)
    // 2 : (2,5,8)
    private _getCol(nb) : Array<number> {
        let res = [];
        switch (nb) {
            case 0:
                res = [this._numbers[0], this._numbers[3], this._numbers[6]];
                break;
            case 1:
                res = [this._numbers[1], this._numbers[4], this._numbers[7]];
                break;
            case 2:
                res = [this._numbers[2], this._numbers[5], this._numbers[8]];
                break;
        }
        return res;
    }
    // anticlockwise rotate
    private _rotate() {
        this._numbers = this._getCol(2).concat(this._getCol(1).concat(this._getCol(0)));     
        this._angle += Math.PI/2;
    }
    
    // anticlockwise rotate 'nb' times
    public rotate(nb:number) {
        for (let i=0; i<nb; i++) {
            this._rotate();
        }
    }
    
    public rotatedCopy(nb:number) : Tile{
        let tile = new Tile(this.name);        
        tile.rotate(nb);        
        return tile;
    }
    
    // This tile can be set on the 'face' of the 'otherTile' ?
    public canBe(onFace:number, otherTile:Tile) : boolean{
        // IF no other tile is given, then this tile can fit anywhere
        if (!otherTile) {
            return true;
        }
        
        let face = this.getFace((onFace+2)%4);
        let otherface = otherTile.getFace(onFace);
        let res = true;
        
        for (let i = 0; i < 3; i++) {
            res = res && face[i] == otherface[i];
        }        
        return res;        
    }
    
    // This tile can be on the 'face' of otherTile1 and on the 'face2" of the otherTile2 ?
    public canBe2(onFace1:number, otherTile1:Tile, onFace2:number, otherTile2:Tile) {
        return this.canBe(onFace1, otherTile1) && this.canBe(onFace2, otherTile2);
    }
    
    public draw(mesh:BABYLON.AbstractMesh, game:Game) {
        mesh.position.copyFrom(this.pos);
        mesh.receiveShadows = true;
        
        let dx = [-1, 0, 1];
        let dz = [1, 0, -1];
        // get original numbers
        let tmp = [];
        tmp = this.name.split('')
        for (let a in tmp) {
            tmp[a] = parseInt(tmp[a], 10);
        }
        for (let i = 0; i < tmp.length; i++) {
            if (tmp[i]==0 && Math.random() > 0.6) {
                let box = game.createAsset('baseBuilding', Game.INSTANCE);
                box.scaling.y = this._randomInt(1,5);
                box.scaling.x = this._randomInt(1,3);
                box.scaling.z = this._randomInt(1,3);
                game.shadows.getShadowMap().renderList.push(box);
                
                box.position.x = dx[i % 3];
                box.position.y = box.scaling.y/4;
                box.position.z = dz[Math.floor(i / 3)];
                box.parent = mesh;
            } else if (tmp[i]==0 && Math.random() > 0.7) {
                
                let arbre = game.createAsset('arbre', Game.INSTANCE);
                game.shadows.getShadowMap().renderList.push(arbre);
                arbre.position.x = dx[i % 3];
                arbre.position.z = dz[Math.floor(i / 3)];
                arbre.parent = mesh;                
            }
        }        
        mesh.rotation.y = -this._angle;  
        
        // Magic optimisation !
        mesh.freezeWorldMatrix();  
        mesh.getDescendants().forEach((m) => {
            (<BABYLON.Mesh> m).freezeWorldMatrix();
        });
    }
    
    private _randomInt(min, max) {
        if (min === max) {
            return (min);
        }
        var random = Math.random();
        return Math.floor(((random * (max - min)) + min));
    }
}