angular.module('CyphorApp')
.config(function($mdThemingProvider) {


	var customPrimary = {
        '50': '#8c8c8c',
        '100': '#7f7f7f',
        '200': '#727272',
        '300': '#656565',
        '400': '#595959',
        '500': '#4C4C4C',
        '600': '#3f3f3f',
        '700': '#323232',
        '800': '#262626',
        '900': '#191919',
        'A100': '#989898',
        'A200': '#a5a5a5',
        'A400': '#b2b2b2',
        'A700': '#0c0c0c'
    };
    $mdThemingProvider
        .definePalette('customPrimary',
                        customPrimary);

    var customAccent = {
        '50': '#000000',
        '100': '#0c0c0c',
        '200': '#191919',
        '300': '#262626',
        '400': '#323232',
        '500': '#3f3f3f',
        '600': '#595959',
        '700': '#656565',
        '800': '#727272',
        '900': '#7f7f7f',
        'A100': '#595959',
        'A200': '#4C4C4C',
        'A400': '#3f3f3f',
        'A700': '#8c8c8c'
    };
    $mdThemingProvider
        .definePalette('customAccent',
                        customAccent);

    var customWarn = {
        '50': '#aef0d7',
        '100': '#98eccd',
        '200': '#83e8c2',
        '300': '#6de4b8',
        '400': '#57e0ad',
        '500': '#42dca3',
        '600': '#2cd899',
        '700': '#25c68a',
        '800': '#21b17b',
        '900': '#1d9b6c',
        'A100': '#c3f4e2',
        'A200': '#d9f8ec',
        'A400': '#eefcf7',
        'A700': '#19865d'
    };
    $mdThemingProvider
        .definePalette('customWarn',
                        customWarn);

    var customBackground = {
        '50': '#737373',
        '100': '#666666',
        '200': '#595959',
        '300': '#4d4d4d',
        '400': '#404040',
        '500': '#333',
        '600': '#262626',
        '700': '#1a1a1a',
        '800': '#0d0d0d',
        '900': '#000000',
        'A100': '#808080',
        'A200': '#8c8c8c',
        'A400': '#999999',
        'A700': '#000000'
    };
    $mdThemingProvider
        .definePalette('customBackground',
                        customBackground);

   $mdThemingProvider.theme('default')
       .primaryPalette('customPrimary')
       .accentPalette('customAccent')
       .warnPalette('customWarn')
       .backgroundPalette('customBackground')
	.dark();


	//$mdThemingProvider.theme('default').primaryPalette('green').dark();
});
