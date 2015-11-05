// Copyright (c) 2015 Mattermost, Inc. All Rights Reserved.
// See License.txt for license information.

function getPrefix() {
    if (global.window.mm_user) {
        return global.window.mm_user.id + '_';
    }

    return 'unknown_';
}

class BrowserStoreClass {
    constructor() {
        this.getItem = this.getItem.bind(this);
        this.setItem = this.setItem.bind(this);
        this.removeItem = this.removeItem.bind(this);
        this.setGlobalItem = this.setGlobalItem.bind(this);
        this.getGlobalItem = this.getGlobalItem.bind(this);
        this.removeGlobalItem = this.removeGlobalItem.bind(this);
        this.actionOnItemsWithPrefix = this.actionOnItemsWithPrefix.bind(this);
        this.actionOnGlobalItemsWithPrefix = this.actionOnGlobalItemsWithPrefix.bind(this);
        this.isLocalStorageSupported = this.isLocalStorageSupported.bind(this);
        this.getLastServerVersion = this.getLastServerVersion.bind(this);
        this.setLastServerVersion = this.setLastServerVersion.bind(this);
        this.clear = this.clear.bind(this);
        this.clearAll = this.clearAll.bind(this);
        this.checkedLocalStorageSupported = '';
        this.signalLogout = this.signalLogout.bind(this);

        var currentVersion = sessionStorage.getItem('storage_version');
        if (currentVersion !== global.window.mm_config.Version) {
            sessionStorage.clear();
            sessionStorage.setItem('storage_version', global.window.mm_config.Version);
        }
    }

    getItem(name, defaultValue) {
        var result = null;
        try {
            result = JSON.parse(sessionStorage.getItem(getPrefix() + name));
        } catch (err) {
            result = null;
        }

        if (result === null && typeof defaultValue !== 'undefined') {
            result = defaultValue;
        }

        return result;
    }

    setItem(name, value) {
        sessionStorage.setItem(getPrefix() + name, JSON.stringify(value));
    }

    removeItem(name) {
        sessionStorage.removeItem(getPrefix() + name);
    }

    setGlobalItem(name, value) {
        try {
            if (this.isLocalStorageSupported()) {
                localStorage.setItem(getPrefix() + name, JSON.stringify(value));
            } else {
                sessionStorage.setItem(getPrefix() + name, JSON.stringify(value));
            }
        } catch (err) {
            console.log('An error occurred while setting local storage, clearing all props'); //eslint-disable-line no-console
            localStorage.clear();
            sessionStorage.clear();
            window.location.href = window.location.href;
        }
    }

    getGlobalItem(name, defaultValue) {
        var result = null;
        try {
            if (this.isLocalStorageSupported()) {
                result = JSON.parse(localStorage.getItem(getPrefix() + name));
            } else {
                result = JSON.parse(sessionStorage.getItem(getPrefix() + name));
            }
        } catch (err) {
            result = null;
        }

        if (result === null && typeof defaultValue !== 'undefined') {
            result = defaultValue;
        }

        return result;
    }

    removeGlobalItem(name) {
        if (this.isLocalStorageSupported()) {
            localStorage.removeItem(getPrefix() + name);
        } else {
            sessionStorage.removeItem(getPrefix() + name);
        }
    }

    getLastServerVersion() {
        return sessionStorage.getItem('last_server_version');
    }

    setLastServerVersion(version) {
        sessionStorage.setItem('last_server_version', version);
    }

    signalLogout() {
        if (this.isLocalStorageSupported()) {
            localStorage.setItem('__logout__', 'yes');
            localStorage.removeItem('__logout__');
        }
    }

    /**
     * Preforms the given action on each item that has the given prefix
     * Signature for action is action(key, value)
     */
    actionOnGlobalItemsWithPrefix(prefix, action) {
        var globalPrefix = getPrefix();
        var globalPrefixiLen = globalPrefix.length;

        var storage = sessionStorage;
        if (this.isLocalStorageSupported()) {
            storage = localStorage;
        }

        for (var key in storage) {
            if (key.lastIndexOf(globalPrefix + prefix, 0) === 0) {
                var userkey = key.substring(globalPrefixiLen);
                action(userkey, this.getGlobalItem(key));
            }
        }
    }

    actionOnItemsWithPrefix(prefix, action) {
        var globalPrefix = getPrefix();
        var globalPrefixiLen = globalPrefix.length;
        for (var key in sessionStorage) {
            if (key.lastIndexOf(globalPrefix + prefix, 0) === 0) {
                var userkey = key.substring(globalPrefixiLen);
                action(userkey, this.getGlobalItem(key));
            }
        }
    }

    clear() {
        sessionStorage.clear();
    }

    clearAll() {
        sessionStorage.clear();
        localStorage.clear();
    }

    isLocalStorageSupported() {
        if (this.checkedLocalStorageSupported !== '') {
            return this.checkedLocalStorageSupported;
        }

        try {
            sessionStorage.setItem('__testSession__', '1');
            sessionStorage.removeItem('__testSession__');

            localStorage.setItem('__testLocal__', '1');
            if (localStorage.getItem('__testLocal__') !== '1') {
                this.checkedLocalStorageSupported = false;
            }
            localStorage.removeItem('__testLocal__', '1');

            this.checkedLocalStorageSupported = true;
        } catch (e) {
            this.checkedLocalStorageSupported = false;
        }

        return this.checkedLocalStorageSupported;
    }
}

var BrowserStore = new BrowserStoreClass();
export default BrowserStore;
