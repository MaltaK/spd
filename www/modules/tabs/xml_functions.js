

export function xml2json(xx) {
    let xml = xx;
    let X = {
        toObj(xml) {
            let o = {};
            if (xml.nodeType == 1) { // element node ..
                if (xml.attributes.length) // element with attributes  ..
                    for (let i = 0; i < xml.attributes.length; i++)
                        o['_' + xml.attributes[i].nodeName] = (xml.attributes[i].nodeValue || '').toString();
                if (xml.firstChild) { // element has child nodes ..
                    let textChild = 0, hasElementChild = false;
                    for (let n = xml.firstChild; n; n = n.nextSibling) {
                        if (n.nodeType == 1) hasElementChild = true;
                        else if (n.nodeType == 3 && n.nodeValue.match(/[^ \f\n\r\t\v]/))
                            textChild++; // non-whitespace text
                    }
                    if (hasElementChild) {
                        if (textChild < 2) { // structured element with evtl. a single text node ..
                            X.removeWhite(xml);
                            for (let n = xml.firstChild; n; n = n.nextSibling) {
                                if (o[n.nodeName]) { // multiple occurence of element ..
                                    if (o[n.nodeName] instanceof Array)
                                        o[n.nodeName][o[n.nodeName].length] = X.toObj(n);
                                    else
                                        o[n.nodeName] = [ o[n.nodeName], X.toObj(n) ];
                                } else // first occurence of element..
                                    o[n.nodeName] = X.toObj(n);
                            }
                        }
                    } else if (textChild && !xml.attributes.length)
                        o = xml.innerHTML;
                }
                if (!xml.attributes.length && !xml.firstChild) o = null;
            } else
                console.log('unhandled node type: ' + xml.nodeType);
            return o;
        },
        removeWhite(e) {
            for (let n = e.firstChild; n;) {
                if (n.nodeType == 3) { // text node
                    if (!n.nodeValue.match(/[^ \f\n\r\t\v]/)) { // pure whitespace text node
                        let nxt = n.nextSibling;
                        e.removeChild(n);
                        n = nxt;
                    } else
                        n = n.nextSibling;
                } else if (n.nodeType == 1) { // element node
                    X.removeWhite(n);
                    n = n.nextSibling;
                }
            }
            return e;
        },
    };
    if (xml.nodeType == 9) // document node
        xml = xml.documentElement;
    return X.toObj(X.removeWhite(xml));
}

export function json2xml(o) {
    let toXml = function(v, name, ind) {
            let xml = '';
            if (v instanceof Array) {
                for (let i = 0, n = v.length; i < n; i++)
                    xml += ind + toXml(v[i], name, ind + '\t') + '\n';
            } else if (typeof(v) == 'object') {
                let hasChild = false;
                xml += ind + '<' + name;
                for (let m in v) {
                    if (m.charAt(0) == '_')
                        xml += ' ' + m.substr(1) + '="' + v[m].toString() + '"';
                    else
                        hasChild = true;
                }
                xml += hasChild ? '>' : '/>';
                if (hasChild) {
                    for (let m in v) {
                        if (m == '#text')
                            xml += v[m];
                        else if (m.charAt(0) != '_')
                            xml += toXml(v[m], m, ind + '\t');
                    }
                    xml += (xml.charAt(xml.length - 1) == '\n' ? ind : '') + '</' + name + '>';
                }
            } else {
                xml += ind + '<' + name + '>' + v.toString() + '</' + name + '>';
            }
            return xml;
        }, xml = '';
    for (let m in o)
        xml += toXml(o[m], m, '');
    xml = '<OBJECTS>' + xml + '</OBJECTS>';
    return xml.replace(/\t/g, '');
}
