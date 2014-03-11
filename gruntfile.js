module.exports = function(grunt) {
	grunt.initConfig({
		pkg: grunt.file.readJSON('package.json'),
		concat:{
			"options" : { "seperator" : ";" },
			build: {
				files:[{
					src: ['src/js/*.js'],
					dest: 'js/<%= pkg.name %>.js',
				},
				{
					src: ['src/css/*.css'],
					dest: 'css/<%= pkg.name %>.css',
				}]
			},
			test: {
				files:[{
					src: ['src/js/*.js'],
					dest:'js/<%= pkg.name %>.min.js',
				},
				{
					src: ['src/css/*.css'],
					dest:'css/<%= pkg.name %>.min.css',
				}]
			}
		},
		uglify: {
			options: {
				mangle: true,
				compress:{
					drop_console:true,
					dead_code:true,
					unsafe:true,
					if_return:true
				},
				banner: '/*! <%= pkg.name %> <%= grunt.template.today("yyyy-mm-dd") %> */\n',
			},
			build:{
				files: {
					'js/<%= pkg.name %>.min.js':[ 'js/<%= pkg.name %>.js' ]
				}
			}
		},
		imageEmbed:{
			build:{
				files: {
					'css/<%= pkg.name %>.css': ['css/<%= pkg.name %>.css'],
				}
			}
		},
		cssmin: {
			options:{
		//		report: 'gzip',
				keepSpecialComments: 0,
			},
			build: {
				files: {
					'css/<%= pkg.name %>.min.css': ['css/<%= pkg.name %>.css']
				}
			}
		},
		embed: {
			options:{
				threshold: '1000KB'
			},
			Slides: {
				files:{
				'slides.html' : 'input.html'
				}
			}
		}
	});
	
	grunt.loadNpmTasks('grunt-contrib-concat');
	grunt.loadNpmTasks('grunt-contrib-uglify');
	grunt.loadNpmTasks('grunt-contrib-cssmin');
	grunt.loadNpmTasks("grunt-image-embed");
	grunt.loadNpmTasks('grunt-embed');
	grunt.registerTask('default',['concat:build', 'uglify','imageEmbed', 'cssmin','embed']);
	grunt.registerTask('test',['concat:test','imageEmbed','embed'])
};
