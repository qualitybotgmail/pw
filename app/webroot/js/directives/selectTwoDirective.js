define(['app', 'angular', 'jquery', 'select2'], function(app, angular, $)
{
    app.directive('selectTwo', 
    [
    	'$timeout',

        function($timeout) {
        	
        	function format(item) { return item.tag; }

			return {
				scope: {
					selectTwo: "=",
					selectTwoModel: "=?ngModel",
					selectTwoOptions: "="
				},
				link: function(scope, element, attrs) {
					var options = { 
						placeholder: attrs.placeholder || 'Select an Option'
					};


					

					if (scope.selectTwoOption) {
						angular.extend(options, scope.selectTwoOption);
					}

	            	scope.$watch('selectTwo', function() {
	            		//console.log(scope.selectTwo)
	            		//element.trigger('select2:updated');

	            		/*if ( ! scope.select2Model) {
	            			element.next().children().first().addClass('ng-pristine ng-invalid ng-invalid-required');
	            		}*/
	            	});
/*
	            	if (attrs.required) {
	            		scope.$watch('select2Model', function() {
	            			element.next().children().first().removeClass('ng-pristine ng-valid ng-invalid ng-invalid-required ng-dirty');

	            			if (scope.select2Model) {
	            				element.next().children().first().addClass('ng-dirty ng-valid ng-valid-required');
	            			} else {
	            				element.next().children().first().addClass('ng-dirty ng-invalid ng-invalid-required');
	            			}
	            		});
	            	}*/

	            	scope.$watch('selectTwoOptions', function() {

	            		console.log(scope.selectTwoOptions);

	            		if (scope.selectTwoOptions) {
							angular.extend(options, scope.selectTwoOptions);

							/*$("#e10").select2({
							    data:[{id:0,text:'enhancement'},{id:1,text:'bug'},{id:2,text:'duplicate'},{id:3,text:'invalid'},{id:4,text:'wontfix'}]
							});*/
							/*element.select2({
							    data:[{"id":1,"text":"Afghanistan"},{"id":2,"text":"Aland Islands"},{"id":3,"text":"Albania"},{"id":4,"text":"Algeria"},{"id":5,"text":"American Samoa"},{"id":6,"text":"Andorra"},{"id":7,"text":"Angola"},{"id":8,"text":"Anguilla"},{"id":9,"text":"Antarctica"},{"id":10,"text":"Antigua and Barbuda"},{"id":11,"text":"Argentina"},{"id":12,"text":"Armenia"},{"id":13,"text":"Aruba"},{"id":14,"text":"Australia"},{"id":15,"text":"Austria"},{"id":16,"text":"Azerbaijan"},{"id":17,"text":"Bahamas"},{"id":18,"text":"Bahrain"},{"id":19,"text":"Bangladesh"},{"id":20,"text":"Barbados"},{"id":21,"text":"Belarus"},{"id":22,"text":"Belgium"},{"id":23,"text":"Belize"},{"id":24,"text":"Benin"},{"id":25,"text":"Bermuda"},{"id":26,"text":"Bhutan"},{"id":27,"text":"Bolivia"},{"id":28,"text":"Bosnia and Herzegovina"},{"id":29,"text":"Botswana"},{"id":30,"text":"Bouvet Island"},{"id":31,"text":"Brazil"},{"id":33,"text":"British Indian Ocean Territory"},{"id":32,"text":"British Virgin Islands"},{"id":34,"text":"Brunei Darussalam"},{"id":35,"text":"Bulgaria"},{"id":36,"text":"Burkina Faso"},{"id":37,"text":"Burundi"},{"id":38,"text":"Cambodia"},{"id":39,"text":"Cameroon"},{"id":40,"text":"Canada"},{"id":41,"text":"Cape Verde"},{"id":42,"text":"Cayman Islands"},{"id":43,"text":"Central African Republic"},{"id":44,"text":"Chad"},{"id":45,"text":"Chile"},{"id":46,"text":"China"},{"id":49,"text":"Christmas Island"},{"id":50,"text":"Cocos (Keeling) Islands"},{"id":51,"text":"Colombia"},{"id":52,"text":"Comoros"},{"id":53,"text":"Congo\u00a0(Brazzaville)"},{"id":54,"text":"Congo, Democratic Republic of the"},{"id":55,"text":"Cook Islands"},{"id":56,"text":"Costa Rica"},{"id":57,"text":"C\u00f4te d'Ivoire"},{"id":58,"text":"Croatia"},{"id":59,"text":"Cuba"},{"id":60,"text":"Cyprus"},{"id":61,"text":"Czech Republic"},{"id":62,"text":"Denmark"},{"id":63,"text":"Djibouti"},{"id":64,"text":"Dominica"},{"id":65,"text":"Dominican Republic"},{"id":66,"text":"Ecuador"},{"id":67,"text":"Egypt"},{"id":68,"text":"El Salvador"},{"id":69,"text":"Equatorial Guinea"},{"id":70,"text":"Eritrea"},{"id":71,"text":"Estonia"},{"id":72,"text":"Ethiopia"},{"id":73,"text":"Falkland Islands (Malvinas)"},{"id":74,"text":"Faroe Islands"},{"id":75,"text":"Fiji"},{"id":76,"text":"Finland"},{"id":77,"text":"France"},{"id":78,"text":"French Guiana"},{"id":79,"text":"French Polynesia"},{"id":80,"text":"French Southern Territories"},{"id":81,"text":"Gabon"},{"id":82,"text":"Gambia"},{"id":83,"text":"Georgia"},{"id":84,"text":"Germany"},{"id":85,"text":"Ghana"},{"id":86,"text":"Gibraltar"},{"id":87,"text":"Greece"},{"id":88,"text":"Greenland"},{"id":89,"text":"Grenada"},{"id":90,"text":"Guadeloupe"},{"id":91,"text":"Guam"},{"id":92,"text":"Guatemala"},{"id":93,"text":"Guernsey"},{"id":94,"text":"Guinea"},{"id":95,"text":"Guinea-Bissau"},{"id":96,"text":"Guyana"},{"id":97,"text":"Haiti"},{"id":98,"text":"Heard Island and Mcdonald Islands"},{"id":99,"text":"Holy See\u00a0(Vatican City State)"},{"id":100,"text":"Honduras"},{"id":47,"text":"Hong Kong, Special Administrative Region of China"},{"id":101,"text":"Hungary"},{"id":102,"text":"Iceland"},{"id":103,"text":"India"},{"id":104,"text":"Indonesia"},{"id":105,"text":"Iran, Islamic Republic of"},{"id":106,"text":"Iraq"},{"id":107,"text":"Ireland"},{"id":108,"text":"Isle of Man"},{"id":109,"text":"Israel"},{"id":110,"text":"Italy"},{"id":111,"text":"Jamaica"},{"id":112,"text":"Japan"},{"id":113,"text":"Jersey"},{"id":114,"text":"Jordan"},{"id":115,"text":"Kazakhstan"},{"id":116,"text":"Kenya"},{"id":117,"text":"Kiribati"},{"id":118,"text":"Korea, Democratic People's Republic of"},{"id":119,"text":"Korea, Republic of"},{"id":120,"text":"Kuwait"},{"id":121,"text":"Kyrgyzstan"},{"id":122,"text":"Lao PDR"},{"id":123,"text":"Latvia"},{"id":124,"text":"Lebanon"},{"id":125,"text":"Lesotho"},{"id":126,"text":"Liberia"},{"id":127,"text":"Libya"},{"id":128,"text":"Liechtenstein"},{"id":129,"text":"Lithuania"},{"id":130,"text":"Luxembourg"},{"id":48,"text":"Macao, Special Administrative Region of China"},{"id":131,"text":"Macedonia, Republic of"},{"id":132,"text":"Madagascar"},{"id":133,"text":"Malawi"},{"id":134,"text":"Malaysia"},{"id":135,"text":"Maldives"},{"id":136,"text":"Mali"},{"id":137,"text":"Malta"},{"id":138,"text":"Marshall Islands"},{"id":139,"text":"Martinique"},{"id":140,"text":"Mauritania"},{"id":141,"text":"Mauritius"},{"id":142,"text":"Mayotte"},{"id":143,"text":"Mexico"},{"id":144,"text":"Micronesia, Federated States of"},{"id":145,"text":"Moldova"},{"id":146,"text":"Monaco"},{"id":147,"text":"Mongolia"},{"id":148,"text":"Montenegro"},{"id":149,"text":"Montserrat"},{"id":150,"text":"Morocco"},{"id":151,"text":"Mozambique"},{"id":152,"text":"Myanmar"},{"id":153,"text":"Namibia"},{"id":154,"text":"Nauru"},{"id":155,"text":"Nepal"},{"id":156,"text":"Netherlands"},{"id":157,"text":"Netherlands Antilles"},{"id":158,"text":"New Caledonia"},{"id":159,"text":"New Zealand"},{"id":160,"text":"Nicaragua"},{"id":161,"text":"Niger"},{"id":162,"text":"Nigeria"},{"id":163,"text":"Niue"},{"id":164,"text":"Norfolk Island"},{"id":165,"text":"Northern Mariana Islands"},{"id":166,"text":"Norway"},{"id":167,"text":"Oman"},{"id":168,"text":"Pakistan"},{"id":169,"text":"Palau"},{"id":170,"text":"Palestinian Territory, Occupied"},{"id":171,"text":"Panama"},{"id":172,"text":"Papua New Guinea"},{"id":173,"text":"Paraguay"},{"id":174,"text":"Peru"},{"id":175,"text":"Philippines"},{"id":176,"text":"Pitcairn"},{"id":177,"text":"Poland"},{"id":178,"text":"Portugal"},{"id":179,"text":"Puerto Rico"},{"id":180,"text":"Qatar"},{"id":181,"text":"R\u00e9union"},{"id":182,"text":"Romania"},{"id":183,"text":"Russian Federation"},{"id":184,"text":"Rwanda"},{"id":186,"text":"Saint Helena"},{"id":187,"text":"Saint Kitts and Nevis"},{"id":188,"text":"Saint Lucia"},{"id":190,"text":"Saint Pierre and Miquelon"},{"id":191,"text":"Saint Vincent and Grenadines"},{"id":185,"text":"Saint-Barth\u00e9lemy"},{"id":189,"text":"Saint-Martin (French part)"},{"id":192,"text":"Samoa"},{"id":193,"text":"San Marino"},{"id":194,"text":"Sao Tome and Principe"},{"id":195,"text":"Saudi Arabia"},{"id":196,"text":"Senegal"},{"id":197,"text":"Serbia"},{"id":198,"text":"Seychelles"},{"id":199,"text":"Sierra Leone"},{"id":200,"text":"Singapore"},{"id":201,"text":"Slovakia"},{"id":202,"text":"Slovenia"},{"id":203,"text":"Solomon Islands"},{"id":204,"text":"Somalia"},{"id":205,"text":"South Africa"},{"id":206,"text":"South Georgia and the South Sandwich Islands"},{"id":207,"text":"South Sudan"},{"id":208,"text":"Spain"},{"id":209,"text":"Sri Lanka"},{"id":210,"text":"Sudan"},{"id":211,"text":"Suriname"},{"id":212,"text":"Svalbard and Jan Mayen Islands"},{"id":213,"text":"Swaziland"},{"id":214,"text":"Sweden"},{"id":215,"text":"Switzerland"},{"id":216,"text":"Syrian Arab Republic\u00a0(Syria)"},{"id":217,"text":"Taiwan, Republic of China"},{"id":218,"text":"Tajikistan"},{"id":219,"text":"Tanzania, United Republic of"},{"id":220,"text":"Thailand"},{"id":221,"text":"Timor-Leste"},{"id":222,"text":"Togo"},{"id":223,"text":"Tokelau"},{"id":224,"text":"Tonga"},{"id":225,"text":"Trinidad and Tobago"},{"id":226,"text":"Tunisia"},{"id":227,"text":"Turkey"},{"id":228,"text":"Turkmenistan"},{"id":229,"text":"Turks and Caicos Islands"},{"id":230,"text":"Tuvalu"},{"id":231,"text":"Uganda"},{"id":232,"text":"Ukraine"},{"id":233,"text":"United Arab Emirates"},{"id":234,"text":"United Kingdom"},{"id":236,"text":"United States Minor Outlying Islands"},{"id":235,"text":"United States of America"},{"id":237,"text":"Uruguay"},{"id":238,"text":"Uzbekistan"},{"id":239,"text":"Vanuatu"},{"id":240,"text":"Venezuela\u00a0(Bolivarian Republic of)"},{"id":241,"text":"Viet Nam"},{"id":242,"text":"Virgin Islands, US"},{"id":243,"text":"Wallis and Futuna Islands"},{"id":244,"text":"Western Sahara"},{"id":245,"text":"Yemen"},{"id":246,"text":"Zambia"},{"id":247,"text":"Zimbabwe"}]
							});*/
							element.select2(options);
						}



	            		//$('select.form-select #test').select2(options);
	            		
	            	});
	            }
			}
        }
    ]);
});