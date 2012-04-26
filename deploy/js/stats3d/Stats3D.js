/**
 * STATS3D Global Abatement
 */

var STATS3D = STATS3D || {};

STATS3D.namespace = function (aNamespace){
    var parts = aNamespace.split('.'),
        parent = STATS3D,
        i;
    if (parts[0] === "STATS3D") {
        parts = parts.slice(1);
    }

    for (i = 0; i < parts.length; i += 1) {
        if (typeof parent[parts[i]] === "undefined") {
            parent[parts[i]] = {};
        }
        parent = parent[parts[i]];
    }

    return parent;
};