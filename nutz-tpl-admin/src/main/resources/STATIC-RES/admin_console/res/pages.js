define(['angular', 'app', 'necros/gritters', 'necros/code-mirror',
        './resource-services',
        'codemirror/mode/htmlmixed/htmlmixed'], function(ng, app) {

app.register.filter('pagedefListFilter', function() {
	return function(pages, f) {
		if (!f) return pages;
		var r = [];
		for (var i = 0; i < pages.length; i ++) {
			var p = pages[i];
			if (p.requestUri.indexOf(f) >= 0) {
				r.push(p);
			}
		}
		return r;
	}
});

function pagesSorter(me, you) {
	return me.requestUri > you.requestUri ? 1 : -1;
}

function isNothing(obj) {
	var t = typeof obj;
	return t == 'undefined' || obj == null;
}

app.register.controller('admin_console.res.pages',
		['$scope', 'admin_console.res.ressvc', 'admin_console.res.pagesvc', 'gritterService',
		 function($scope, ResourceService, PageService, gritterService) {
	var gritters = gritterService.Light(gritterService.Gritters);
	$scope.sections =
		[
			'admin_console.res.pages.addpage',
			'admin_console.res.pages.editpage',
			'admin_console.res.pages.addscript',
			'admin_console.res.pages.editscript'
		];
	$scope.isNothing = isNothing;
	$scope.goback = function() {
		$scope.visibleSection = null;
	};
	
	$scope.pages = PageService.all(function(r) {
		if (typeof r.stackTrace !== 'undefined') {
			gritters.error({text: 'Failure on query: ' + (r.detailMessage || 'Unkown error.')});
		} else {
			var lst = [];
			for (var i = 0; i < r.pages.length; i ++) {
				var p = r.pages[i];
				lst.push({
					requestUri: p,
					pageUrl: p
				});
			}
			for (var i = 0; i < r.scripts.length; i ++) {
				var s = r.scripts[i];
				var u = s.replace(/.groovy$/, '.html');
				var f = null;
				for (var j = 0; j < lst.length; j ++) {
					var p = lst[j];
					if (p.pageUrl && p.pageUrl == u) {
						f = p;
						p.scriptUrl = s;
						break;
					}
				}
				if (!f) {
					lst.push({
						requestUri: u,
						scriptUrl: s
					});
				}
			}
			lst.sort(pagesSorter);
			r.result = lst;
		}
	});
	$scope.templates = ResourceService.templates({type: 'page'});
	
	$scope.addPage = function(page) {
		$scope.editingItem = {
			path: (page ? page.requestUri : null)
		};
		$scope.visibleSection = 'admin_console.res.pages.addpage';
	};
	
	function exists(url, prop) {
		var lst = $scope.pages.result;
		if (!lst || !lst.length) return;
		for (var i = 0; i < lst.length; i ++) {
			var f = lst[i];
			if (f[prop] == url) return f;
		}
	}
	
	function saveNewPage() {
		var itm = $scope.editingItem;
		var url = $scope.editingItem.path;
		var found = exists(url, 'pageUrl');
		if (found) {
			gritters.error({text: 'This page already exists.'});
			return;
		}
		var tpl = $scope.editingItem.template;
		if (!tpl) {
			gritters.error({text: 'Please choose a template.'});
			return;
		}
		PageService.add({url: itm.path, templateName: tpl.path}, {}, function(p) {
			return function(r) {
				if (typeof r.stackTrace !== 'undefined') {
					gritters.error({text: 'Failure when saving: ' + (r.detailMessage || 'Unknown error.')});
				} else {
					var page = exists(p, 'requestUri');
					if (page) {
						page.pageUrl = p;
					} else {
						page = {
							requestUri: p,
							pageUrl: p
						};
						$scope.pages.result.push(page);
						$scope.pages.result.sort(pagesSorter);
					}
					editPage(page);
				}
			};
		}(itm.path), function(h) {
			gritters.error({text: 'Failure when saving, code: ' + h.status + '[' + h.statusText + ']'});
		});
	}
	$scope.saveNewPage = saveNewPage;

	function editPage(page) {
		$scope.editingItem = ng.extend({}, page);
		getPageContent($scope.editingItem);
		$scope.visibleSection = 'admin_console.res.pages.editpage';
	}
	$scope.editPage = editPage;
	
	function getPageContent(page) {
		$scope.loadingPage = true;
		PageService.get({url: page.pageUrl}, function(r) {
			$scope.loadingPage = false;
			if (typeof r.stackTrace !== 'undefined') {
				gritters.error({text: 'Failure loading content: ' + (r.detailMessage || 'Unkown error.')});
			}
			page.page = r.result || null;
		});
	}
	$scope.getPageContent = getPageContent;
	
	function savePageContent(page) {
		$scope.savingPage = true;
		PageService.update({url: page.pageUrl}, {content: page.page}, function(r) {
			$scope.savingPage = false;
			if (typeof r.stackTrace !== 'undefined') {
				gritters.error({text: 'Failure loading content: ' + (r.detailMessage || 'Unkown error.')});
			} else {
				gritters.success({text: 'Saved.'});
				page.page = r.result || null;
			}
		});
	};
	$scope.savePageContent = savePageContent;
	$scope.removePage = function(page) {
		alert('Not implemented yet.');
	};
}]);

});
