
"use strict";

window.addEventListener('load', function(){

    var monCanvas = document.getElementById('monCanvas');
    var divCompetences = document.getElementById('competences');
    var images = document.getElementsByTagName('img');
    var start = document.getElementById('start');
    var cv = document.getElementById('CV');
    var cmd = document.getElementById('cmd');
    var regles = document.getElementById('Regles');
    var xCursor;
    var ctx, joueur, balle, niveau, demarrer = false, flagVitesse = false, flagCmdOrRegles = false;
    

    // initialisation du canvas lors de la création de la partie
    var initCanvas = function(zoneDeJeu){


        zoneDeJeu.width = 500;   
        zoneDeJeu.height = 600;
        zoneDeJeu.style.position = "absolute";
        zoneDeJeu.style.left = "22%";
        zoneDeJeu.style.top = "20%";
        zoneDeJeu.style.border = "1px solid black";
        zoneDeJeu.style['background-color'] = "white";
        zoneDeJeu.style.display = 'block';

        $(zoneDeJeu).animate({

            opacity: '1'

        });

        return zoneDeJeu.getContext('2d');

    }


    // Choix de la difficulté du jeu par l'utilisateur lors du lancement du jeu
    var choixUtilisateur = function(){

            do {
                var choixNiveau = prompt("Choisissez votre difficulté : (respectivement  1 => 'Facile'  2 => 'Moyen'   3 => 'Difficile' ");
                    
            } while (isNaN(choixNiveau) || (choixNiveau > 3 || choixNiveau < 1));
    
            return choixNiveau;

    }

    // affichage des compétences au fil du temps en fonction du score 
    var afficherCompetences = function(){

        

            if (joueur.score >= 7500 ){

            
             $(images[6]).animate({

              opacity: '1'

              });

            
            } else if (joueur.score >= 6500 ){

        
                 $(images[5]).animate({
  
                  opacity: '1'
  
                  });



             } else if (joueur.score >= 5500 ){

              
               $(images[4]).animate({

                opacity: '1'

                });

            } else if ( joueur.score >= 4500 ){

               
                $(images[3]).animate({

                    opacity: '1'

                });

            }  else if (joueur.score >= 2500 ){

               
                $(images[2]).animate({

                    opacity: '1'

                });

            }  else if ( joueur.score >= 1500 ){

            
                $(images[1]).animate({

                    opacity: '1'

                });

            } else if ( joueur.score >= 500 ){

               
                images[0].style.opacity = '1';
                
                $(divCompetences).animate({

                    opacity: '1'

                }); 
                images[0].style.display = 'inline';
                
            }
            
    }


    // Constructeur pour la création du niveau qui va être jouer par l'utilisateur   
   var Niveau = function(choixJoueur){

        this.tableauDeBlock = [];
        this.difficulte = choixJoueur;
        this.Block = new BlockStatiqueADetruire(); // création d'un objet block pour récupérer sa hauteur, largeur et décalage 


        this.remplirTableauBlock = function(nombresDeLignesMax, resistance){

            

            for(let nombresdeLignes = 0,  y= this.Block.decalage + this.Block.hauteur ; nombresdeLignes < nombresDeLignesMax  ; nombresdeLignes++, y += this.Block.decalage + this.Block.hauteur){

                    // x responsive par rapport a la largeur du Canvas
                    for (let x = monCanvas.width * 35 / 400; x + this.Block.largeur + this.Block.decalage < monCanvas.width - 10; x+= this.Block.largeur + this.Block.decalage){

                        this.tableauDeBlock.push(new BlockStatiqueADetruire(x,y,resistance));

                    }

                }

        };
    
        this.chargementNiveau = function(){

            if(1 == this.difficulte){

                    this.remplirTableauBlock(2,2);
                
            } else if( 2 == this.difficulte){

                this.remplirTableauBlock(4,3);
                

            } else if (3 == this.difficulte){

                this.remplirTableauBlock(6,5);
                

            }
            
        }

        this.dessiner = function(){


            for (let i = 0; i < this.tableauDeBlock.length; i++){

                ctx.beginPath();
                ctx.rect(this.tableauDeBlock[i].x, this.tableauDeBlock[i].y, this.tableauDeBlock[i].largeur,this.tableauDeBlock[i].hauteur);
                ctx.fillStyle = 'orange';
                ctx.fill();
                ctx.closePath();
    
            }

        }

   }
    
    var BlockJoueurPrincipal = function(x, y){

        this.x = x;
        this.y = y;
        this.largeur = 60;
        this.hauteur = 20;
        this.vie = 3;
        this.score = 0;

        this.dessiner = function(){

            
            ctx.beginPath();
            ctx.rect(this.x, this.y, this.largeur,this.hauteur);
            ctx.fillStyle = "orange";
            ctx.fill();
            ctx.closePath();

        }

        this.afficherScore = function(){

            ctx.font = "20px Arial";
            ctx.fillStyle = "black";
            ctx.fillText("Score : " + this.score, (10 * monCanvas.width) / 400 ,18);

        }


        this.afficherVie = function() {

            ctx.font = "20px Arial";
            ctx.fillStyle = "black";
            ctx.fillText("Vie : " + this.vie, monCanvas.width - 70 ,18);

        }

       
        
    }
    

    var BlockStatiqueADetruire = function(x, y,resistance){

        this.x = x;
        this.y = y;
        this.largeur = 50;    
        this.hauteur = 20;    
        this.resistance = resistance;
        this.decalage = 20;

    }

    var Balle = function(x, y){

        this.x = x;
        this.y = y;
        this.largeur = 10;
        this.hauteur = 10;
        this.vitesseDirectionX = 4;
        this.vitesseDirectionY = -4;
        this.enDeplacement = false;

       this.dessiner = function(){

        ctx.beginPath();
        ctx.arc(this.x, this.y, 5, 0, Math.PI*2);
        ctx.fillStyle = "grey";
        ctx.fill();
        ctx.closePath();


       }
        
        this.miseAJourPosition = function(){ 
            
            
            this.collisionCanvas();
            this.collisionBlock();
            
        }


        this.collisionCanvas = function(){

            if (this.x < 0 || this.x > monCanvas.width){

                this.vitesseDirectionX = -this.vitesseDirectionX;
                this.x += this.vitesseDirectionX;

            } else if (this.y < 0){

                this.vitesseDirectionY = -this.vitesseDirectionY;
                this.y += this.vitesseDirectionY;

            } else if (this.y > monCanvas.height - 30 && this.x >= xCursor  && this.x <= xCursor + joueur.largeur){

                this.vitesseDirectionY = -this.vitesseDirectionY;
                this.y += this.vitesseDirectionY;

            } else if (this.y > monCanvas.height - 20){

                this.enDeplacement = false;
                this.vitesseDirectionY = -this.vitesseDirectionY;
                joueur.vie--;
                

            } else {

                this.x += this.vitesseDirectionX;
                this.y += this.vitesseDirectionY;

            }

        }

        this.collisionBlock = function(){
            
            for (let i = 0 ; i < niveau.tableauDeBlock.length; i++){

                //collision de la balle avec n'importe quel coté d'un block 
              if(this.x >= niveau.tableauDeBlock[i].x && this.x <= niveau.tableauDeBlock[i].x + niveau.tableauDeBlock[i].largeur && this.y >= niveau.tableauDeBlock[i].y && this.y <= niveau.tableauDeBlock[i].y + niveau.tableauDeBlock[i].hauteur){

                // incrémentation du score

                joueur.score += 100;


                //Audio de collision du block
                document.getElementById('collision').playbackRate = 2.0;
                document.getElementById('collision').play();
                  
              
                this.vitesseDirectionY = -this.vitesseDirectionY;
                this.y += this.vitesseDirectionY;  

                

                //condition pour l'inversement de la direction en X si la balle tape du coté gauche ou droit d'un block
                if(this.x >= niveau.tableauDeBlock[i].x && this.x <= niveau.tableauDeBlock[i].x + niveau.tableauDeBlock[i].largeur && this.y >= niveau.tableauDeBlock[i].y && this.y <= niveau.tableauDeBlock[i].y + niveau.tableauDeBlock[i].hauteur){

                /* inversion de la direction en Y car la balle est toujours en collision avec le block, et inversion de la direction en X 
                car la balle à touché soit le coté gauche ou droit */
                this.vitesseDirectionY = -this.vitesseDirectionY;
                this.vitesseDirectionX = -this.vitesseDirectionX;
                this.x += this.vitesseDirectionX;

                }

                // effacement de la brique car sa resistance vaut à présent zéro.
                if (--niveau.tableauDeBlock[i].resistance == 0){

                    document.getElementById('detruit').play();
                    if( i == niveau.tableauDeBlock.length -1) {

                        niveau.tableauDeBlock.pop();
    
                    } else {
                     var temp = niveau.tableauDeBlock[i];
                     niveau.tableauDeBlock[i] = niveau.tableauDeBlock[niveau.tableauDeBlock.length - 1];
                     niveau.tableauDeBlock[niveau.tableauDeBlock.length - 1] = temp;
                     niveau.tableauDeBlock.pop();
                    }
                    joueur.score += 500;
                    
                }

                break;
            }
          
         }         
            
        }

    }


    var boucleDeJeu = function(){

        ctx.clearRect(0,0,monCanvas.width, monCanvas.height);
        joueur.afficherScore();
        afficherCompetences();
        joueur.afficherVie();
        niveau.dessiner();
        if(balle.enDeplacement){

            if (niveau.tableauDeBlock.length == 0){
                
                document.getElementById('victory').play();
                
                alert("BRAVO Vous avez gagné, Cliquez sur 'Ok' pour accéder à mon CV");  
                monCanvas.style.display = 'none';
                $(cv).css('display', 'inline');
                $(cv).animate({

                    opacity:'1'

                })
                
                return;

         } 
         
         if(niveau.tableauDeBlock.length == 5 && !flagVitesse) {

            balle.vitesseDirectionX *= 1.5;
            balle.vitesseDirectionY *= 1.5;
            flagVitesse = true;

        }

            balle.miseAJourPosition();
            balle.dessiner();
            joueur.dessiner();

        } else if(joueur.vie == 0){

            document.getElementById('gameOver').play();
            alert("GAME OVER");
            document.location.reload();

        } else {
            balle.x =  xCursor + (joueur.largeur / 2);
            balle.y = monCanvas.height - 35;
            joueur.dessiner();
            balle.dessiner();
        }
        
        // Lorsque je clique sur le lien commandes ou regles du jeu dans le html, cela doit arreter la boucle de jeu
        if (flagCmdOrRegles){

            return;
        }
        
        window.requestAnimationFrame(boucleDeJeu);

    }


        monCanvas.addEventListener('mousemove', function(event){


           
            xCursor = event.offsetX;
           

            if(xCursor > monCanvas.width - joueur.largeur){

                xCursor = monCanvas.width - joueur.largeur; 
            }    
                
                joueur.x = xCursor;
                joueur.y = monCanvas.height - 30;
               

            if(!balle.enDeplacement){

               
                balle.x = xCursor + (joueur.largeur / 2);   
                balle.y = monCanvas.height - 35;
               
            }
                
        }); 
    
        monCanvas.addEventListener('click', function(){

            if(balle.x ==  xCursor + (joueur.largeur / 2) && balle.y == monCanvas.height - 35){

                balle.enDeplacement = true;
            }
           

        });

        start.addEventListener('click', function(){

            if(!demarrer){
 
            niveau = new Niveau(choixUtilisateur()); 
            document.getElementById('intro').play();   
            ctx = initCanvas(monCanvas); 
            joueur = new BlockJoueurPrincipal((monCanvas.width - 30) / 2, monCanvas.height - 30); 
            balle = new Balle(joueur.x + joueur.largeur / 2, monCanvas.height - 35);  
            niveau.chargementNiveau();  
            demarrer = true;
            boucleDeJeu();   

        }



        });
       
        cmd.addEventListener('click', function(){

            flagCmdOrRegles = true;

            document.getElementById('CV').style.display = 'none';

            document.getElementById('commandes').style.display = 'block';

            document.getElementById('regles').style.display = 'none';

            monCanvas.style.display = 'none';

            document.getElementById('competences').style.display = 'none';

            start.style.display = 'none';


        })

        regles.addEventListener('click', function(){

            flagCmdOrRegles = true;

            document.getElementById('CV').style.display = 'none';

            document.getElementById('commandes').style.display = 'none';

            document.getElementById('regles').style.display = 'block';

            monCanvas.style.display = 'none';

            document.getElementById('competences').style.display = 'none';

            start.style.display = 'none';


        })
        

}); 

