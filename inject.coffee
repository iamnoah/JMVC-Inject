if steal.plugins
	steal.plugins('jquery')('//inject/inject-core.js')('//inject/controller.js').
		then('//inject/cache.js')
else
	steal('jquery','jquery/lang','./inject-core.js','./controller.js').then('./cache.js')
