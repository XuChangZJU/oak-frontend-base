var Interpreter = (function (r) {
    var o = '';
    function i(r, n) {
        return r
            ? 'string' == typeof r
                ? r
                : r
                      .reduce(function (r, t) {
                          return r.concat([
                              (function (n, e) {
                                  if (((e = e || {}), 'string' == typeof n))
                                      return n;
                                  {
                                      var r, t, u;
                                      if (n[2] && 'object' == typeof n[2])
                                          return (
                                              (r = Object.keys(n[2]).reduce(
                                                  function (r, t) {
                                                      return (
                                                          (r[t] = i(
                                                              n[2][t],
                                                              e
                                                          )),
                                                          r
                                                      );
                                                  },
                                                  {}
                                              )),
                                              (t = r[e[0]]),
                                              void 0 !== (u = e[n[0]])
                                                  ? r[u.toString()] ||
                                                    r.other ||
                                                    o
                                                  : t || r.other || o
                                          );
                                  }
                                  if ('object' == typeof n && 0 < n.length)
                                      return (function r(t, n, e) {
                                          void 0 === e && (e = 0);
                                          if (!n || !t || t.length <= 0)
                                              return '';
                                          n = n[t[e]];
                                          if ('string' == typeof n) return n;
                                          if ('number' == typeof n)
                                              return n.toString();
                                          if (!n)
                                              return '{'.concat(
                                                  t.join('.'),
                                                  '}'
                                              );
                                          return r(t, n, ++e);
                                      })(n[0].split('.'), e, 0);
                                  return '';
                              })(t, n),
                          ]);
                      }, [])
                      .join('')
            : o;
    }
    function c(r, t, n) {
        return (
            ('object' == typeof r &&
                ((t = t).constructor && 'Array' === t.constructor
                    ? t
                    : t
                          .replace(getRegExp('\[', 'ig'), '.')
                          .replace(getRegExp('\]', 'ig'), '')
                          .split('.')
                ).reduce(function (r, t) {
                    return (r || {})[t];
                }, r)) ||
            n
        );
    }
    function f(r) {
        var t = r;
        return (t =
            r && -1 !== r.indexOf(':')
                ? r.replace(getRegExp(':', 'ig'), '.')
                : t);
    }
    function g(r, t, n) {
        var e = f(n),
            r = r[t];
        return (r && (r[e] || c(r, e))) || n;
    }
    return (
        (r.getMessageInterpreter = function () {
            function u(r, t, n, e) {
                return i(
                    (function (r, t, n, e) {
                        var u = f(r);
                        if (!(n = t[n])) return g(t, e, r);
                        var o = n[u];
                        return (o = o || c(n, u)) ? o : g(t, e, r);
                    })(r, e, n, n),
                    t
                );
            }
            return function (r, t, n, e) {
                return 3 === arguments.length
                    ? u(r, null, t, n)
                    : 4 === arguments.length
                    ? u(r, t, n, e)
                    : '';
            };
        }),
        r
    );
})({});
