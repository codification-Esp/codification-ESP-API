'use strict';




module.exports = function(Etage) {
  




  /**
   * renvoie l'ensembles des chambres et leurs positions occuppes
   * @param {Function(Error, array)} callback
   */

  Etage.prototype.reservations = function(callback) {
      Etage.prototype.__get__chambres({"include":{"relation":"reservations","scope":{"fields":["position"]}}},function (err, chambres) {
        chambres.filter(function (ch) {
          if(ch.reservations().length < ch.capacite)
            return true;
          else
            return false;
        });
      callback(null, chambres);
    });
  };

};
