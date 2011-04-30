/**
 * @author: Rogerio Vicente <http://rogeriopvl.com>
 * @license: GPLv3 <http://www.gnu.org/licenses/gpl.html>
 */
var hashrExtension = {
	
	request: null,
	
	makeHash: function(){

		var str = document.getElementById("str").value;
		var hashtype = document.getElementById("hashtype").value;
		var params = "str=" + str + "&hashtype=" + hashtype + "&client_app=chrome";
		hashrExtension.request = new XMLHttpRequest();
		
		document.getElementById("result_area").style.display = "none";
		document.getElementById("loading_area").style.display = "block";
		
		var remoteURL = "http://rogeriopvl.com/hashr/api2/hash";
		var developmentURL = 'http://localhost/hashr_website/api2/hash';

		/* remoteURL = developmentURL; */

		hashrExtension.request.open("POST", remoteURL, true);
		hashrExtension.request.onreadystatechange = hashrExtension.getResponse;
		hashrExtension.request.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
		hashrExtension.request.send(params);
	},
	
	getResponse: function(){
		if (hashrExtension.request.readyState == 4){
			if (hashrExtension.request.status == 200){
				document.getElementById("loading_area").style.display = "none";
				document.getElementById("result_area").style.display = "block";
				document.getElementById("result").setAttribute("value", hashrExtension.request.responseText);
			}
			else{
				document.getElementById("loading_area").style.display = "none";
				document.getElementById("result_area").style.display = "block";
				document.getElementById("result").setAttribute("value", "Error contacting server...");
			}
		}
	},
	
	copyHash: function(){
		document.getElementById("result").select();
		document.execCommand("copy", false, null);
		hashrExtension.show_copied();
	},

	// show a copied message in the toolbar
	show_copied: function() {
		var copiedLabel = document.getElementById('copied');
		if (copiedLabel) { return false; }

		var copyContainer = document.getElementById('result_area');
		var newElement = document.createElement('span');
		newElement.setAttribute('id', 'copied');
		newElement.innerHTML = 'Copied!';
		copyContainer.appendChild(newElement);

		// only show the copied message for 4 seconds
		 window.setTimeout(function(){
			 var element = document.getElementById('copied');
			 if(element){
				 element.parentNode.removeChild(element);
			 }
		 }, 4000);
	},
};