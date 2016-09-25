module.exports = function (grunt) {

    require('time-grunt')(grunt);

    // load all grunt tasks
    require('jit-grunt')(grunt);

    grunt.initConfig({

        // Clean dist folder (all except lib folder)
        clean: {
            js: ["dist/css","dist/js/.baseDir*","dist/js/*", "!dist/js/libs/**"],
            dist: ["dist/js/*", "!dist/js/index.js", "!dist/js/libs/**"]
        },

        // Compilation from TypeScript to ES5²
        ts: {
            dev: {
                src : ['ts/**/*.ts', 'ts/typings/**/*'],
                outDir: "dist/js",
                options:{
                    module: 'amd',
                    target: 'es5',
                    declaration: false,
                    sourceMap:true,
                    removeComments:false
                }
            },
            dist: {
                src : ['ts/**/*.ts'],
                outDir: "dist/js",
                options:{
                    module: 'amd',
                    target: 'es5',
                    declaration: false,
                    sourceMap:false,
                    removeComments:true
                }
            }
        },
        // Watches content related changes
        watch : {
            js : {
                files: ['ts/**/*.ts'],
                tasks: ['ts:dev']
            },
            sass : {
                files: ['sass/**/*.scss'],
                tasks: ['sass','postcss:debug']
            },
            html : {
                files: ['html/**/*.html'],
                tasks: ['bake']
            }
        },
        // Build dist version
        uglify : {
            dist: {
                options: {
                    compress:true,
                    beautify: false
                },
                files: {
                    'dist/js/index.js': ['dist/js/**/*.js', '!dist/js/libs/**/*.js']
                }
            }
        },
        // Sass compilation. Produce an extended css file in css folder
        sass : {
            options: {
                sourcemap:'none',
                style: 'expanded'
            },
            dist : {
                files: {
                    'dist/css/main.css': 'sass/main.scss'
                }
            }
        },
        // Auto prefixer css
        postcss : {
            debug : {
                options: {
                    processors: [
                        require('autoprefixer')({browsers: 'last 2 versions'})
                    ]
                },
                src: 'dist/css/main.css'
            },
            dist: {
                options: {
                    processors: [
                        require('autoprefixer')({browsers: 'last 2 versions'}),
                        require('cssnano')()
                    ]
                },
                src: 'dist/css/main.css'
            }
        },
        //Server creation
        connect: {
            server: {
                options: {
                    port: 3000,
                    base: '.'
                }
            },
            test: {
                options: {
                    port: 3000,
                    base: '.',
                    keepalive:true
                }
            }
        },
        // Open default browser
        open: {
            local: {
                path: 'http://localhost:3000/dist'
            }
        }
    });

    grunt.registerTask('default', 'Compile and watch source files', [
        'dev',
        'connect:server',
        'open',
        'watch'
    ]);

    grunt.registerTask('run', 'Run the webserver and watch files', [
        'connect:server',
        'open',
        'watch'
    ]);

    grunt.registerTask('dev', 'build dev version', [
        'clean:js',
        'ts:dev',
        'sass',
        'postcss:debug'
    ]);

    grunt.registerTask('test', 'test dist version', [
        'open',
        'connect:test'
    ]);

    grunt.registerTask('dist', 'build dist version', [
        'clean:js',
        'ts:dist',
        'sass',
        'postcss:dist',
        'uglify',       // compile js files in index.js
        'clean:dist'    // remove js file
    ]);

};


