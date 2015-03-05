/**
 * @author: Rogerio Vicente <http://rogeriopvl.com>
 * @license: GPLv3 <http://www.gnu.org/licenses/gpl.html>
 */

(function () {
    'use strict';

    var API_URL = 'https://hashr.rogeriopvl.com/api2';

    var hashrExtension = {

        offlineAlgos: [
            'md5',
            'sha1',
            'sha256',
            'sha512',
            'sha3',
            'ripemd160'
        ],

        offlineMode: false,

        lastUsedAlgo: null,

        makeRequest: function (method, url, params, cb) {
            params = params || null;

            var req = new XMLHttpRequest();
            req.open(method, url, true);
            req.onreadystatechange = function () {
                if (req.readyState === 4) {
                    cb(req.responseText, req.status);
                }
            };

            if (method === 'POST') {
                req.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
            }
            req.send(params);

            return req;
        },

        fillAlgos: function (algos) {
            document.getElementById('hashtype').innerHTML = '';
            algos.forEach(function(item) {
                var opt = document.createElement('option');
                opt.value = item;
                opt.innerHTML = item;
                if (item === this.lastUsedAlgo) {
                    opt.selected = true;
                }
                document.getElementById('hashtype').appendChild(opt);
            }.bind(this));
        },

        getAlgos: function () {
            if (this.offlineMode) {
                this.fillAlgos(this.offlineAlgos);
                return;
            }

            var that = this;
            chrome.storage.local.get(null, function (value) {
                if (!value.algos) {
                    var algosURL = API_URL + '/algos';
                    that.makeRequest('GET', algosURL, null, function (data, status) {
                        var algosList = JSON.parse(data);
                        this.fillAlgos(algosList);
                        chrome.storage.local.set({ algos: algosList });
                    }.bind(that));
                } else {
                    that.lastUsedAlgo = value.favorite;
                    that.fillAlgos(value.algos);
                }
            });
        },

        makeHash: function () {

            var str = document.getElementById('str').value;
            var hashtype = document.getElementById('hashtype').value;
            var params = 'str=' + str + '&hashtype=' + hashtype + '&client_app=chrome';

            var loadingArea = document.getElementById('loading_area');
            var resultArea = document.getElementById('result_area');

            chrome.storage.local.set({ favorite: hashtype });

            resultArea.style.display = 'none';
            loadingArea.style.display = 'block';

            var remoteURL = API_URL + '/hash';

            var hashCallback = function (data, status, msg) {
                var resultEl = document.getElementById('result');

                if (status === 200) {
                    loadingArea.style.display = 'none';
                    resultArea.style.display = 'block';
                    resultEl.setAttribute('value', data);
                } else { // error case
                    try {
                        data = JSON.parse(data);
                    } catch (e) {
                        data = false;
                    }
                    loadingArea.style.display = 'none';
                    resultArea.style.display = 'block';
                    msg = (!msg && status < 500) ? 'Error: ' + data.message : msg;
                    resultEl.setAttribute('value', msg || 'Error contacting server...');
                }
            };

            if (this.offlineMode) {
                if (!CryptoJS.hasOwnProperty(hashtype.toUpperCase())) {
                    return hashCallback('', 400, 'Unknown hashing algorithm');
                }
                var hashObj = CryptoJS[hashtype.toUpperCase()](str);
                return hashCallback(hashObj.toString(CryptoJS.enc.Hex), 200);
            }
            return this.makeRequest('POST', remoteURL, params, hashCallback);
        },

        copyHash: function () {
            document.getElementById('result').select();
            document.execCommand('copy', false, null);
            hashrExtension.showCopied();
        },

        // show a copied message in the toolbar
        showCopied: function () {
            var copiedLabel = document.getElementById('copied');
            if (copiedLabel) { return false; }

            var copyContainer = document.getElementById('result_area');
            var newElement = document.createElement('span');
            newElement.setAttribute('id', 'copied');
            newElement.innerHTML = 'Copied!';
            copyContainer.appendChild(newElement);

            // only show the copied message for 4 seconds
            window.setTimeout(function () {
                var element = document.getElementById('copied');
                if (element) {
                    element.parentNode.removeChild(element);
                }
            }, 4000);
        },
    };

    document.addEventListener('DOMContentLoaded', function () {
        var offlineCheckbox = document.getElementById('offlineMode');
        var helpBox = document.getElementById('help');

        chrome.storage.local.get(null, function (value) {
            offlineCheckbox.checked = value.offline;
            hashrExtension.offlineMode = value.offline;
            hashrExtension.getAlgos();
        });

        offlineCheckbox.addEventListener('click', function (ev) {
            hashrExtension.offlineMode = this.checked;
            chrome.storage.local.set({ offline: this.checked });
            hashrExtension.getAlgos();
        });

        document.getElementById('hash_form')
        .addEventListener('submit', function (ev) {
            ev.preventDefault();
            hashrExtension.makeHash();
        });
        document.getElementById('copy_button')
        .addEventListener('click', hashrExtension.copyHash.bind(hashrExtension));

        document.getElementById('helpBtn').addEventListener('click', function () {
            helpBox.hidden = !helpBox.hidden;
        });
    });
}());
