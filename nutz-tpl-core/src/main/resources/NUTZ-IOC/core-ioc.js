var ioc = {
	"velocityConfig": {
		"type": "tpl.velocity.VelocityConfig",
		"fields": {
			"ioc": {"refer": "$ioc"}
		}
	},
	"groovyConfig": {
		"type": "tpl.groovy.GroovyConfig",
		"fields": {
			"ioc": {"refer": "$ioc"}
		}
	},
	"systemPropertiesSource": {
		"type": "tpl.config.SystemPropertiesSource",
	},
	"corePropertiesFileSource": {
		"type": "tpl.config.PropertiesFileSource",
		"args": [["NUTZ-IOC/core-config.properties"]]
	},
	"coreConfigSource": {
		"type": "tpl.config.CompositeSource",
		"fields": {
			"sourceList": [{
				"refer": "systemPropertiesSource"
			}, {
				"refer": "corePropertiesFileSource"
			}]
		}
	}
    "coreConfig" : {
        "type" : "tpl.config.PlaceholderConfigure",
        "fields" : {
            "source" : {
            	"refer": "coreConfigSource"
            }
        }
    },
    "coreDataStartupRunner": {
    	"type": "tpl.nutz.DataTablesInitializer",
        "fields" : {
            "dao" : {
            	"refer": "coreDao"
            }
        }
    },
    "administrativeAccountStartupChecker": {
    	"type": "tpl.shiro.AdministrativeAccountStartupChecker",
        "fields" : {
            "dao" : {
            	"refer": "coreDao"
            }
        }
    }
};