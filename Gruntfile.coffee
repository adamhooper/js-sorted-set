module.exports = (grunt) ->
  grunt.initConfig
    coffee:
      compile:
        options:
          sourceMap: true
        expand: true
        flatten: false
        cwd: 'coffee'
        src: [ '**/*.coffee' ]
        dest: 'js/'
        ext: '.js'

      test:
        expand: true
        flatten: false
        cwd: 'spec-coffee'
        src: [ '**/*.coffee' ]
        dest: 'spec/'
        ext: '.js'

    requirejs:
      development:
        options:
          name: 'SortedSet'
          baseUrl: 'js/'
          optimize: 'none'
          out: './sorted-set.js'

      minified:
        options:
          name: 'SortedSet'
          baseUrl: 'js/'
          optimize: 'uglify2'
          out: './sorted-set.min.js'

    jasmine:
      all:
        src: 'js/**/*.js'
        options:
          specs: 'spec/**/*Spec.js'
          helpers: 'spec/**/*Helper.js'
          template: require('grunt-template-jasmine-requirejs')
          templateOptions:
            requireConfig:
              baseUrl: 'js/'

  grunt.loadNpmTasks('grunt-contrib-coffee')
  grunt.loadNpmTasks('grunt-contrib-requirejs')
  grunt.loadNpmTasks('grunt-contrib-jasmine')

  grunt.registerTask('default', [ 'coffee', 'requirejs' ])
  grunt.registerTask('test', [ 'coffee', 'jasmine' ])
