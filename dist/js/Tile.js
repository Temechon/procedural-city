// 0 1 2
// 3 4 5
// 6 7 8
var Tile = (function () {
    function Tile(name) {
        this._numbers = [];
        this.pos = new BABYLON.Vector3(0, 0, 0);
        this._angle = 0;
        this.name = name;
        // Creates numbers
        var tmp = name.split('');
        for (var a in tmp) {
            this._numbers[a] = parseInt(tmp[a], 10);
        }
    }
    Tile.prototype.toString = function () {
        return this._numbers.toString();
    };
    // => top : (0 1 2)
    // => right : (2 5 8)
    // => bot : (6 7 8)
    // => left : (0 3 6)
    Tile.prototype.getFace = function (face) {
        var res = [];
        switch (face) {
            case Tile.TOP:
                res = [this._numbers[0], this._numbers[1], this._numbers[2]];
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
    };
    // 0 : (0,3,6)
    // 1 : (1,4,7)
    // 2 : (2,5,8)
    Tile.prototype._getCol = function (nb) {
        var res = [];
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
    };
    // anticlockwise rotate
    Tile.prototype._rotate = function () {
        this._numbers = this._getCol(2).concat(this._getCol(1).concat(this._getCol(0)));
        this._angle += Math.PI / 2;
    };
    // anticlockwise rotate 'nb' times
    Tile.prototype.rotate = function (nb) {
        for (var i = 0; i < nb; i++) {
            this._rotate();
        }
    };
    Tile.prototype.rotatedCopy = function (nb) {
        var tile = new Tile(this.name);
        tile.rotate(nb);
        return tile;
    };
    // This tile can be set on the 'face' of the 'otherTile' ?
    Tile.prototype.canBe = function (onFace, otherTile) {
        // IF no other tile is given, then this tile can fit anywhere
        if (!otherTile) {
            return true;
        }
        var face = this.getFace((onFace + 2) % 4);
        var otherface = otherTile.getFace(onFace);
        var res = true;
        for (var i = 0; i < 3; i++) {
            res = res && face[i] == otherface[i];
        }
        return res;
    };
    // This tile can be on the 'face' of otherTile1 and on the 'face2" of the otherTile2 ?
    Tile.prototype.canBe2 = function (onFace1, otherTile1, onFace2, otherTile2) {
        return this.canBe(onFace1, otherTile1) && this.canBe(onFace2, otherTile2);
    };
    Tile.prototype.draw = function (mesh, game) {
        mesh.position.copyFrom(this.pos);
        mesh.receiveShadows = true;
        var dx = [-1, 0, 1];
        var dz = [1, 0, -1];
        // get original numbers
        var tmp = [];
        tmp = this.name.split('');
        for (var a in tmp) {
            tmp[a] = parseInt(tmp[a], 10);
        }
        for (var i = 0; i < tmp.length; i++) {
            if (tmp[i] == 0 && Math.random() > 0.6) {
                var box = game.createAsset('baseBuilding', Game.INSTANCE);
                box.scaling.y = this._randomInt(1, 5);
                box.scaling.x = this._randomInt(1, 3);
                box.scaling.z = this._randomInt(1, 3);
                game.shadows.getShadowMap().renderList.push(box);
                box.position.x = dx[i % 3];
                box.position.y = box.scaling.y / 4;
                box.position.z = dz[Math.floor(i / 3)];
                box.parent = mesh;
            }
            else if (tmp[i] == 0 && Math.random() > 0.7) {
                var arbre = game.createAsset('arbre', Game.INSTANCE);
                game.shadows.getShadowMap().renderList.push(arbre);
                arbre.position.x = dx[i % 3];
                arbre.position.z = dz[Math.floor(i / 3)];
                arbre.parent = mesh;
            }
        }
        mesh.rotation.y = -this._angle;
        // Magic optimisation !
        mesh.freezeWorldMatrix();
        mesh.getDescendants().forEach(function (m) {
            m.freezeWorldMatrix();
        });
    };
    Tile.prototype._randomInt = function (min, max) {
        if (min === max) {
            return (min);
        }
        var random = Math.random();
        return Math.floor(((random * (max - min)) + min));
    };
    Tile.TOP = 0;
    Tile.RIGHT = 1;
    Tile.BOT = 2;
    Tile.LEFT = 3;
    return Tile;
}());
//# sourceMappingURL=Tile.js.map