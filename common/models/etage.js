'use strict';

<<<<<<< HEAD
var app = require('../../server/server');
var _ = require("underscore");
=======


>>>>>>> 875c9ae18388acd3b97e52685b40db92af681f09

module.exports = function(Etage) {
  




  /**
<<<<<<< HEAD
   * l'ensemble des chambres d'un étage et leurs positions occuppées
=======
   * renvoie l'ensembles des chambres et leurs positions occuppes
>>>>>>> 875c9ae18388acd3b97e52685b40db92af681f09
   * @param {Function(Error, array)} callback
   */

  Etage.prototype.reservations = function(callback) {
<<<<<<< HEAD
      var id = this.id;
      //console.log(id);
      Etage.app.models.Chambre.find( {'where':{'etageId':id},'include':'reservations'}
        ,function(err, chambres) {
          chambres.filter( function (ch) {
            //console.log(ch.etageId);
            //console.log(id);
            //console.log(_.ch.etageId.toNumber()===_.id.toNumber());
            if(ch.reservations().length < ch.capacite ) {
              
              return true;
            }
          else
            return false;
        });
          callback(null, chambres);
      });

};
=======
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
>>>>>>> 875c9ae18388acd3b97e52685b40db92af681f09

};
