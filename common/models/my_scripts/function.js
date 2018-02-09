'use strict';
module.exports = {
  testContrainte: function(etudiant, contrainte) {
    if (!contrainte) {
      return true;
    }
    let resultatult = false;

    var val = etudiant[contrainte.attribut];
    var expected = contrainte.valeur;
    if (contrainte.comparaison == '=') {
      resultat = val == expected;
    } else if (contrainte.comparaison == '>=') {
      resultat = val >= +expected;
    } else if (contrainte.comparaison == '>') {
      resultat = val > +expected;
    } else if (contrainte.comparaison == '<=') {
      resultat = val <= +expected;
    } else if (contrainte.comparaison == '<') {
      resultat = val < +expected;
    } else if (contrainte.comparaison == '!=') {
      resultat = val != +expected;
    }
    return resultat;
  },
  testAllContraintes: function(etudiant, contraintes) {
    if (!contraintes | contraintes.length == 0) {
      return true;
    }
    let resultat = contraintes.find(cont => {
      return module.exports.testContrainte(etudiant, cont) == false;
    });
    return !resultat;
  },
};
