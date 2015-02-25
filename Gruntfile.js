module.exports = function( grunt ) {

    // Load grunt tasks from NPM packages
    require( 'load-grunt-tasks' )( grunt );

    var srcFiles = [
            '<%= dirs.build %>/pixi.js/bin/pixi.dev.js',
            '<%= dirs.build %>/flicker.js'
        ],
        banner = [
            '/**',
            ' * @license',
            ' * <%= pkg.name %> - v<%= pkg.version %>',
            ' * Copyright (c) 2012-2014, Yuan Tao',
            ' * <%= pkg.homepage %>',
            ' *',
            ' * Compiled: <%= grunt.template.today("yyyy-mm-dd") %>',
            ' *',
            ' * <%= pkg.name %> is licensed under the <%= pkg.license %> License.',
            ' * <%= pkg.licenseUrl %>',
            ' */',
            ''
        ].join('\n');

    grunt.initConfig({
        pkg : grunt.file.readJSON('package.json'),
        dirs: {
            build: 'build',
            dist: 'dist',
            docs: 'docs',
            src: 'src',
            test: 'test'
        },
        files: {
            srcBlob: '<%= dirs.src %>/**/*.js',
            testBlob: '<%= dirs.test %>/**/*.js',
            testConf: '<%= dirs.test %>/karma.conf.js',
            build: '<%= dirs.build %>/flicker.js',
            dist: '<%= dirs.dist %>/flicker.js',
            distMin: '<%= dirs.dist %>/ficker.min.js'
        },
        clean: {
            build: ['<%= dirs.build %>'],
            release: ['<%= dirs.dist %>']
        },
        browserify: {
            flicker: {
                src: ['index.js'],
                dest: '<%= files.build %>',
                options: {
                    browserifyOptions: {
                        standalone: 'Flicker'
                    }
                    //external: ['jquery', 'momentWrapper']
                }
            }
        },
        concat: {
            options: {
                banner: banner
            },
            dist: {
                src: srcFiles,
                dest: '<%= files.dist %>'
            }
        },
        /* jshint -W106 */
        concat_sourcemap: {
            dev: {
                files: {
                    '<%= files.build %>': srcFiles
                },
                options: {
                    sourceRoot: '../'
                }
            }
        },
        bowercopy: {
            all: {
                options: {
                    destPrefix: 'build'
                },
                files: {
                    'pixi.js/bin': 'pixi.js/bin',
                    'pixi.js/LICENSE.txt': 'pixi.js/LICENSE'
                }
            }
        },
        jshint: {
            options: {
                jshintrc: './.jshintrc'
            },
            source: {
                src: srcFiles.concat('Gruntfile.js'),
                options: {
                    ignores: [
                        '<%= dirs.src %>/**/{flicker}.js',
                        '<%= dirs.build %>/**/*.js'
                    ]
                }
            },
            test: {
                src: ['<%= files.testBlob %>'],
                options: {
                    ignores: '<%= dirs.test %>/lib/resemble.js',
                    jshintrc: undefined, //don't use jshintrc for tests
                    expr: true,
                    undef: false,
                    camelcase: false
                }
            }
        },
        uglify: {
            options: {
                banner: banner
            },
            dist: {
                src: '<%= files.dist %>',
                dest: '<%= files.distMin %>'
            }
        },
        connect: {
            test: {
                options: {
                    hostname: '0.0.0.0',
                    port: grunt.option('port-test') || 9002,
                    base: './',
                    keepalive: true
                }
            }
        },
        yuidoc: {
            compile: {
                name: '<%= pkg.name %>',
                description: '<%= pkg.description %>',
                version: '<%= pkg.version %>',
                url: '<%= pkg.homepage %>',
                logo: '<%= pkg.logo %>',
                options: {
                    paths: '<%= dirs.src %>',
                    outdir: '<%= dirs.docs %>'
                }
            }
        },
        //Watches and builds for _development_ (source maps)
        watch: {
            scripts: {
                files: ['<%= dirs.src %>/**/*.js'],
                tasks: ['concat_sourcemap'],
                options: {
                    spawn: false
                }
            }
        }
    });

    grunt.registerTask('default', ['build', 'test']);

    grunt.registerTask('build', ['clean', 'jshint:source', 'bowercopy', 'browserify', 'concat', 'uglify', 'clean:build']);
    grunt.registerTask('build-debug', ['clean', 'bowercopy', 'browserify', 'concat_sourcemap', 'uglify', 'clean:build']);

    //grunt.registerTask('test', ['bowercopy', 'browserify', 'concat', 'jshint:test', 'karma']);
    grunt.registerTask('test', []);

    grunt.registerTask('server', ['build', 'connect:test']);

    grunt.registerTask('docs', ['yuidoc']);

    grunt.registerTask('debug-watch', ['bowercopy', 'browserify', 'concat_sourcemap', 'watch:debug']);

};
