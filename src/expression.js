/*
USAGE:
  var e = new Expression('a+b');
  console.log(e.eval({ 'a': 10, 'b': 2 })); // results 12
  console.log(e.eval({ 'b': 2, c: 34, 'a': 10 })); // also results in 12 (but reuse the pre-compiled function)

  // for filtering purposes
  import fs from 'fs';
  const data = JSON.parse(fs.readFileSync('./data.json', 'utf8'));
  var exp = new Expression("value.indexOf('a')>=0")
  var filtered = data.filter((item) => exp.eval(item));
  console.log(filtered)
*/
export default class Expression {

  constructor(str) {
    try {
      var val = str.replace(/(\!==|\!=)/g, "§§§").replace(/===/g, "@@@").replace(/(==)|(@@@)/g, "===").replace(/§§§/g, "!==");
      if (val.indexOf("${") >= 0 && (!/^`.*`$/.test(this.trim(val))))
        val = "`" + val + "`";
      this.expression = val;
    } catch (error) {
      this.expression = undefined;
    }
  }

  parseContext(context) {
    var args = [];
    var variables = [];
    Object.keys(context || {}).sort().forEach(($v) => {
      if (this.expression.indexOf($v) >= 0 && !(/(\s+|\r?\n|\r|\t)/.test($v))) {
        args.push($v);
        variables.push(context[$v])
      }
    });
    return { args: args, vars: variables };
  };

  eval(context) {
    try {
      if (!this.expression) return undefined;
      var ref = this.parseContext(context);
      console.log(ref);
      this.fn = this.fn || Function.apply(null, [...ref.args, "return " + this.expression]);
      return this.fn.apply(this, ref.vars);
    } catch (e) {
      return undefined;
    }
  }

  assert(docjs,) {
    return this.eval(docjs,) ? true : false;
  }

}

