'use strict';

var app = require('../../server/server');
var _ = require("underscore");

module.exports = function(Etage) {
  




  /**
   * l'ensemble des chambres d'un étage et leurs positions occuppées
   * @param {Function(Error, array)} callback
   */

  Etage.prototype.reservations = function(callback) {
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

};
