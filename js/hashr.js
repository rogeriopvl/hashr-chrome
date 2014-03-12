/**
 * @author: Rogerio Vicente <http://rogeriopvl.com>
 * @license: GPLv3 <http://www.gnu.org/licenses/gpl.html>
 */

var hashrExtension = {

    request: null,

    makeRequest: function(method, url, params, cb){
        params = params || null;

        var req = new XMLHttpRequest();
        req.open(method, url, true);
        req.onreadystatechange = function(){
            if (req.readyState === 4) {
                cb(req.responseText, req.status);
            }
        };

        if (method === 'POST') {
            req.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
        }
        req.send(params);

        return req;
    },

    fillAlgos: function(algos){
        algos.forEach(function(item) {
            var opt = document.createElement('option');
            opt.value = item;
            opt.innerHTML = item;
            if (item === 'md5') {
                opt.selected = true;
            }
            document.getElementById('hashtype').appendChild(opt);
        });
    },

    getAlgos: function(){
        var algosURL = 'http://hashr.rogeriopvl.com/api2/algos';
        this.makeRequest('GET', algosURL, null, function(data, status){
            this.fillAlgos(JSON.parse(data));
        }.bind(this));
    },

    makeHash: function(){

        var str = document.getElementById("str").value;
        var hashtype = document.getElementById("hashtype").value;
        var params = "str=" + str + "&hashtype=" + hashtype + "&client_app=chrome";

        document.getElementById("result_area").style.display = "none";
        document.getElementById("loading_area").style.display = "block";

        var remoteURL = "http://hashr.rogeriopvl.com/api2/hash";
        var developmentURL = 'http://localhost/hashr_website/api2/hash';

        /* remoteURL = developmentURL; */

        this.makeRequest('POST', remoteURL, params, function(data, status) {
            if (status === 200) {
                document.getElementById("loading_area").style.display = "none";
                document.getElementById("result_area").style.display = "block";
                document.getElementById("result").setAttribute("value", data);
            } else { // error case
                document.getElementById("loading_area").style.display = "none";
                document.getElementById("result_area").style.display = "block";
                document.getElementById("result").setAttribute(
                    'value',
                    'Error contacting server...'
                );
            }
        });
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

hashrExtension.getAlgos();

document.addEventListener('DOMContentLoaded', function(){
    document.getElementById('hashr_bttn')
    .addEventListener('click', hashrExtension.makeHash.bind(hashrExtension));
    document.getElementById('copy_button')
    .addEventListener('click', hashrExtension.copyHash.bind(hashrExtension));
});
