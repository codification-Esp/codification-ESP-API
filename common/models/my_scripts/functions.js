'use strict';
module.exports = {
  testContrainte: function(etudiant, contrainte) {
    if (!contrainte) {
      return true;
    }
    let res = false;

    var val = etudiant[contrainte.attribut];
    var expected = contrainte.valeur;
    if (contrainte.comparaison == '=') {
      res = val == expected;
    } else if (contrainte.comparaison == '>=') {
      res = val >= +expected;
    } else if (contrainte.comparaison == '>') {
      res = val > +expected;
    } else if (contrainte.comparaison == '<=') {
      res = val <= +expected;
    } else if (contrainte.comparaison == '<') {
      res = val < +expected;
    } else if (contrainte.comparaison == '!=') {
      res = val != +expected;
    }
    return res;
  },
  testAllContraintes: function(etudiant, contraintes) {
    if (!contraintes | contraintes.length == 0) {
      return true;
    }
    let res = contraintes.find(cont => {
      return module.exports.testContrainte(etudiant, cont) == false;
    });
    return !res;
  },
};
