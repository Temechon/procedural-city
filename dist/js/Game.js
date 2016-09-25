var Game = (function () {
    function Game(canvasId) {
        var _this = this;
        this._allTiles = [];
        var canvas = document.getElementById(canvasId);
        this.engine = new BABYLON.Engine(canvas, true);
        this.engine.enableOfflineSupport = false;
        this.scene = null;
        window.addEventListener("resize", function () {
            _this.engine.resize();
        });
        this._initScene();
    }
    Game.prototype._run = function () {
        var _this = this;
        this.scene.executeWhenReady(function () {
            // Remove loader
            var loader = document.querySelector("#loader");
            loader.style.display = "none";
            _this._initGame();
            _this.engine.runRenderLoop(function () {
                _this.scene.render();
            });
        });
    };
    Game.prototype._initScene = function () {
        this.scene = new BABYLON.Scene(this.engine);
        this.scene.clearColor = BABYLON.Color3.FromInts(0, 163, 136);
        var camera = new BABYLON.FreeCamera('', new BABYLON.Vector3(-6, 21, -36), this.scene);
        camera.rotation = new BABYLON.Vector3(0.44, 0.73, 0);
        camera.attachControl(this.engine.getRenderingCanvas());
        var light = new BABYLON.HemisphericLight('', new BABYLON.Vector3(0, 1, 0), this.scene);
        light.intensity = 0.4;
        var dir = new BABYLON.DirectionalLight('', new BABYLON.Vector3(0.5, -1, 0.25), this.scene);
        dir.position.copyFrom(dir.direction.scale(-10));
        var shadowGenerator = new BABYLON.ShadowGenerator(2048, dir);
        shadowGenerator.useBlurVarianceShadowMap = true;
        shadowGenerator.setDarkness(0.05);
        shadowGenerator.bias = 0.0001;
        shadowGenerator.blurScale = 2;
        this.shadows = shadowGenerator;
        var loader = new Preloader(this);
        loader.callback = this._run.bind(this);
        loader.loadAssets();
    };
    Game.prototype._initGame = function () {
        // this.scene.debugLayer.show(); 
        var _this = this;
        // Get available tiles
        for (var _i = 0, _a = this.scene.meshes; _i < _a.length; _i++) {
            var mesh = _a[_i];
            if (mesh.name.substr(0, 1) == '0' || mesh.name.substr(0, 1) == '1') {
                var tile = new Tile(mesh.name);
                this._allTiles.push(tile);
                this._allTiles.push(tile.rotatedCopy(1));
                this._allTiles.push(tile.rotatedCopy(2));
                this._allTiles.push(tile.rotatedCopy(3));
            }
        }
        // Create base building
        var baseBuilding = BABYLON.MeshBuilder.CreateBox('baseBuilding', { size: 0.5 }, this.scene);
        var buildingMat = new BABYLON.StandardMaterial('baseBuildingMat', this.scene);
        buildingMat.diffuseColor = BABYLON.Color3.White();
        buildingMat.specularColor = BABYLON.Color3.Black();
        baseBuilding.material = buildingMat;
        baseBuilding.setEnabled(false);
        // Build city
        var len = 30;
        var city = [];
        var timers = [];
        var delay = 0;
        var _loop_1 = function(j) {
            city[j] = [];
            var _loop_2 = function(i) {
                var timer = new Timer(delay, this_1.scene, { autodestroy: true });
                timer.callback = function () {
                    var sel = _this.findNextTile(i, j, city);
                    sel.pos.x = i * 3;
                    sel.pos.z = -j * 3;
                    sel.draw(_this.createAsset(sel.name, Game.CLONE, sel.toString()), _this);
                    city[j][i] = sel;
                };
                timers.push(timer);
                delay += 150;
            };
            for (var i = 0; i < len; i++) {
                _loop_2(i);
            }
        };
        var this_1 = this;
        for (var j = 0; j < len; j++) {
            _loop_1(j);
        }
        for (var _b = 0, timers_1 = timers; _b < timers_1.length; _b++) {
            var t = timers_1[_b];
            t.start();
        }
    };
    // i -> line
    // j -> line
    Game.prototype.findNextTile = function (i, j, city) {
        // Get last tile of the city
        var previousLine = null, topTile = null, leftTile = null;
        if (j > 0) {
            previousLine = city[j - 1];
            topTile = city[j - 1][i];
        }
        if (i > 0) {
            leftTile = city[j][i - 1];
        }
        // random sort tiles
        this._shuffle(this._allTiles);
        return this._findMatchingTile(topTile, Tile.BOT, leftTile, Tile.RIGHT);
    };
    Game.prototype._findMatchingTile = function (tile, face, tile2, face2) {
        for (var i = 0; i < this._allTiles.length; i++) {
            if (this._allTiles[i].canBe2(face, tile, face2, tile2)) {
                return this._allTiles[i];
            }
        }
    };
    Game.prototype.createAsset = function (name, mode, newName) {
        if (mode === void 0) { mode = Game.SELF; }
        if (newName === void 0) { newName = ''; }
        var mesh = this.scene.getMeshByName(name);
        var res = null;
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
    };
    Game.prototype._shuffle = function (array) {
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
    };
    Game.SELF = 0;
    Game.CLONE = 1;
    Game.INSTANCE = 2;
    return Game;
}());
//# sourceMappingURL=Game.js.map