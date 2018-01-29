'use strict';


module.exports = function(Account) {
 
  var app = require('../../server/server');
  var f = require('./my_scripts/functions');




    /**
   * renvoient l'ensemble des batiments accessible a l'etudiant
   * @param {Function(Error, array)} callback
   */

  Account.prototype.batimentsAccessibles = function(callback) {
    var id = this.id;
    app.models.Batiment.find(
        {include: 'contraintes'},
        function(err, b) {
          if (err) return callback(err);

          app.models.Etudiant.find(
              {'where': {'accountId': id}},
              function(err, etuds) {
                if (err) return callback(err);
                var i = 0;
                var list = [];
                while (i < b.length) {
                  if (f.testAllContraintes(etuds[0], b[i].contraintes())) {
                    var bat = {
                      'num': b[i].numbatiment,
                      'id': b[i].id
                    };
                    list.push(bat);
                  }
                  i++;
                }
                callback(null, list);
              });
        }
    );
  };
  /**
 * renvoie les etages qui sont accessibles dans un batiment donne
 * @param {string} batiment L'id du batiment dans le quel on recherche des etages
 * @param {Function(Error, string)} callback
 */

  Account.prototype.etagesAccessibles = function(batiment, callback) {
    var id = this.id;
    app.models.Etage.find(
        {include: 'contraintes'},
        function(err, etages) {
          if (err) return callback(err);
          app.models.Etudiant.find(
              {'where': {'accountId': id}},
              function(err, etuds) {
                if (err) return callback(err);
                var i = 0;
                var list = [];
                while (i < etages.length) {
                  if (f.testAllContraintes(etuds[0], etages[i].contraintes())) {
                    var e = {
                      'numero': etages[i].numetage,
                      'id': etages[i].id
                    };
                    list.push(e);
                  }
                  i++;
                }
                callback(null, list);
              });
        }
    );
  };

/**
 * renvoie les couloirs qui sont accessibles dans un etage donné
 * @param {string} batiment L'id de l'étage dans lequel on recherche des couloirs accessibles
 * @param {Function(Error, string)} callback
 */

Account.prototype.couloirsAccessibles = function(etage,callback) {
	var id = this.id;
    app.models.Couloir.find(
        {include: 'contraintes'},
        function(err, couloirs) {
          if (err) return callback(err);
          app.models.Etudiant.find(
              {'where': {'accountId': id}},
              function(err, etuds) {
                if (err) return callback(err);
                var i = 0;
                var list = [];
                while (i < couloirs.length) {
                  if (f.testAllContraintes(etuds[0], couloirs[i].contraintes())) {
                    var e = {
                      'numero': couloirs[i].numcouloir,
                      'id': couloirs[i].id
                    };
                    list.push(e);
                  }
                  i++;
                }
                callback(null, list);
              });
        }
    );
};


/**
   * confirmer une réservation
   * @param {string} code de la réservation
   * @param {Function(Error, date)} callback
   */


Account.prototype.confirmerReservation = function(code, callback) {
    var accountId = this.id;
    Account.app.models.CodeReservation.findOne({where:{code: code}}, function (err, codeReserv) {
      if(err)
        callback(err);
      else{
        app.models.Reservation.findOne( {'where':{'id':codeReserv.idReservation}}, function (err, reserv) {
            if(err)
              callback(err);
            else{
              if(_.isEqual(reserv.accountId, accountId)){
                reserv.updateAttributes({confirme:true}, function (err, reser) {
                  if(err)
                    callback(err);
                  else{
                    codeReserv.destroy(function (err) {
                      if(err)
                        callback(err);
                      else
                        callback(null, true);
                    });
                  }
                });
              }else{
                callback(null, false);
              }
            }
          });
      }
    });
  };


};
