'use strict';

var config = require('../../server/config.json');
var path = require('path');
module.exports = function(Account) {
 
  var app = require('../../server/server');
  var f = require('./my_scripts/functions');

//send verification email after registration
  Account.afterRemote('create', function(context, accountInstance, next) {
    console.log('> Account.afterRemote triggered');

    var options = {
      type: 'email',
      to: accountInstance.email,
      from: 'codificationcoudesp@gmail.com',
      subject: 'Thanks for registering.',
      template: path.resolve(__dirname, '../../server/verify.ejs'),
      redirect: '/verified',
      user: accountInstance
    };
    accountInstance.verify(options, function(err, response) {
      if (err) {
        Account.deleteById(accountInstance.id); 
        return next(err);
      }

      console.log('> verification email sent:', response);

      var url_confirmer = 'http://localhost:8080/api/Accounts/confirm?uid='+response.uid+'&token='+response.token;
        const mail = {
          from: 'codificationcoudesp@gmail.com', // addresse source
          to: accountInstance.email, // adresse destinataire
          subject: 'Confirmation de votre inscription', // objet du mail
                  html: `<p>INscription réussie</p>
                  
                    <p>Vous pouvez confirmer en cliquant sur: <a href="${url_confirmer}">${url_confirmer}</a></p>`
                  };
                  console.log(mail);
        Account.app.models.Email.send(mail ,function (err, info) {
                  if(err) {
                    console.log(err);
                    callback(err);
                  };
                }
        );
    });
  });





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
                      'nombatiment': b[i].nombatiment,
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
        {'where':{'batiment_fk':batiment},'include':'contraintes'},
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
 * retourne l'ensemble des batiments disponibles en y incluant les etages 
        et les chambres pour un etudiant donne
 * @param {Function(Error, object)} callback
 */


Account.prototype.chambresAccessibles = function(callback) {
    var list=[];
    Account.prototype.batimentsAccessibles( (err,batiments) =>{
      if(err) 
        callback(err);
      
      else {
        batiments.forEach( (batiment, ind1, bats) => {
          Account.prototype.etagesAccessibles(batiment.id,(err,etages) => {
            if (err) 
              callback(err);
            else {

              etages.forEach( (etage , ind, etgs) => {
                Account.app.models.Etage.findById(etage.id, (err, etg) => {
                  etg.reservations((err, chambres) => {
                    if(err) {
                      callback(err);
                    }else {
                      etgs[ind].chambres = chambres;
                      if(ind == etgs.length -1 )
                        bats[ind1].etages = etgs;
                      if((ind1 == bats.length - 1) && (ind == etgs.length - 1)  )
                        callback(null, {'batiments': bats});
                    }
                  });
                });
                
              });
            };
          });
        });
      };
    
    
    }); 
};   

//les différents informations du logement d'un étudiant donné

Account.prototype.logements = function(callback) {
    Account.app.models.Reservation.findOne(
      {'where': {'accountId': this.id, 'confirme': true}, 'include': 'chambre'},
    function(err, reserv) {
      if (err)
        callback(err);
      if (!reserv)
        callback(null, null);
      else
        Account.app.models.Etage.findById(reserv.chambre().etageId, '', function(err, etage) {
          if (err)
            callback(err);
          Account.app.models.Batiment.findById(etage.batimentId, '', function(err, batiment) {
            if (err)
              callback(err);
            callback(null, {'chambre': reserv.chambre(), 'etage': etage, 'batiment': batiment});
          });
        });
    });
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
