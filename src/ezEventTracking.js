'use strict';

// CONSTRUCTOR
function ezEventTracking(options) {

    if (typeof options === 'undefined'){
        options = {};
    }

    this._optsGlobal = this._globalDefaults;

    if (typeof options.global !== 'undefined'){
        this._optsGlobal = this._merge(this._globalDefaults, options.global);
    }
    var eDef = this._optsGlobal.eventDefault;
    this._cLog('_optsGlobal', this._optsGlobal);

    this._optsDefault = this._eventDefaults;
    this._optsEvents = {};
    if (typeof options.events !== 'undefined' && typeof options.events[eDef] !== 'undefined'){
        this._optsDefault = this._merge(this._eventDefaults, options.events[eDef]);
        delete options.events[eDef];
        this._optsEvents = options.events;
    }
    this._cLog('_optsDefault', this._optsDefault);
    this._cLog('_optsEvents', this._optsEvents);

    this._disableRightClick();
}

// the method that makes the Event happen
ezEventTracking.prototype.ezGAEvent = function(gaeThis) {

    if (typeof gaeThis === 'undefined'){
        gaeThis = {};
    }

    // before we go on to the magic, check for active === false
    if (typeof gaeThis.active !== 'undefined' && ( gaeThis.active === false || gaeThis.active == 'false')) {
        this._cLog('gaeThis.active: false > return', gaeThis);
        return;
    }

    this._cLog('gaeThis', gaeThis);
    var eBase = this._optsDefault;
    // perhaps there's no events args to merge over the defaults
    if (typeof gaeThis.event !== 'undefined') {
        var eKey = gaeThis.event;
        if (typeof this._optsEvents[eKey] !== 'undefined') {
            eBase = this._merge(this._optsDefault, this._optsEvents[eKey]);
        } else {
            this._cLog('gaeThis.event not a valid events (key)', gaeThis);

        }
    } else {
        this._cLog('gaeThis.event not specified', gaeThis);
    }
    this._cLog('eBase: post-merge', eBase);

    var ePush = eBase;
    if (typeof gaeThis != 'undefined') {
        ePush = this._merge(eBase, gaeThis)
    }
    this._cLog('_ePush: post-merge', ePush);
    if (ePush.active === false || ePush.active == 'false'){
        this._cLog('ePush.active: false > return', ePush);
        return;
    }
    // this is it. time to make the magic happen!

    // value must be an integer
    if ( ePush.value % 1 === 0 ) {
        ePush.value =  parseInt(ePush.value);
    }

    if ( this._optsGlobal.ga != 'ga.js'){
        this._cLog('ePush.active: true > ga.js ga', ePush);
        // https://developers.google.com/analytics/devguides/collection/analyticsjs/events
        // ga('send', 'event', 'category', 'action', 'label', value);
        if  ( ePush.nonInteraction  === true || ePush.nonInteraction == true ) {
            // ref: http://www.lunametrics.com/blog/2014/05/06/noninteraction-events-google-analytics/
            ga('send', 'event', ePush.category, ePush.action, ePush.label, ePush.value, {'nonInteraction': 1});
        } else{
            ga('send', 'event', ePush.category, ePush.action, ePush.label, ePush.value);
        }

    }else{
        // google analytics expects 0 or 1, and doesn't seem to like false and true. (?)
        if ( (ePush.nonInteraction != 0) && (ePush.nonInteraction != 1) ) {
            if  ( ePush.nonInteraction  === true || ePush.nonInteraction == true ) {
                ePush.nonInteraction =  1;
            } else {
                ePush.nonInteraction = 0;
            }
        }
        this._cLog('ePush.active: true > analytics.js _gaq.push', ePush);
        _gaq.push(['_trackEvent',ePush.category, ePush.action, ePush.label, ePush.value, ePush.nonInteraction ]);
    }
    // prehaps you don't want full on debug but still wanna console.log the events.
    if ( this._optsGlobal.logEvent == true ){
        console.log('_optsGlobal.logDebug: true');
        console.log(ePush);
    }
}


// global defaults
ezEventTracking.prototype._globalDefaults = {
    dataPrefix: '',
    rightClick : true,
    logDebug: false,
    logEvent: false,
    eventDefault: 'default',
    ga: 'ga.js'
}

// events defaults
ezEventTracking.prototype._eventDefaults = {
    active: true,
    event: null,
    category: 'Uetrk',
    action: 'Uclick',
    label: 'ezET TODO',
    value: 0,
    nonInteraction:true
}

// the console.log
ezEventTracking.prototype._cLog = function(logLabel,logThis){
    if ( this._optsGlobal.logDebug === true ){
        console.log(logLabel);
        console.log(logThis);
    }
}

ezEventTracking.prototype._disableRightClick = function(){
    if ( this._optsGlobal.rightClick === false ){
        $(document).on("contextmenu",function(e){
            return false;
        });
    }
}

// simple object / array "merge"
ezEventTracking.prototype._merge = function(master,overlay){

    if (typeof master === "undefined") {
        return {};
    }
    var merged = master;
    if (typeof overlay === "undefined") {
        return merged;
    }
    for (var key in master){
        if (overlay.hasOwnProperty(key)) {
            merged[key] = overlay[key];
        }
    }
    return merged;
}

// get the data attributes off the aThis element
ezEventTracking.prototype.getData = function(aThis){

    var preFix = this._optsGlobal.dataPrefix;
    var eDefs = this._eventDefaults;
    var thisAttr;
    var dataAttrs = {};
    for (var key in eDefs) {
        thisAttr = aThis.getAttribute('data-' + preFix + key);
        if ( thisAttr !== null){
            dataAttrs[key] = thisAttr;
        }
    }
    this._cLog('dataAttrs', dataAttrs);
    return dataAttrs;
}