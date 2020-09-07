// tslint:disable:max-line-length
import * as _ from 'lodash'

const bundeslaender = getBundeslaender()
const kleinregionen = getKleinregionen()
const grossregionen = getGrossregionen()

export const regions = {
    kleinregionen,
    grossregionen, 
    bundeslaender,
    mapGrossreg,
    mapKleinreg,
    mapBundeslaender
}

function mapGrossreg(val: any) {
    if(!val) {
      return ''
    } 
      var i = 0
      for(i; i < regions.grossregionen.length; i++) {
      if(val.includes(regions.grossregionen[i].shorten)) {
        var regex = new RegExp(regions.grossregionen[i].shorten, 'g')
        if(val.includes(',')) {
          val = val.replace(regex, regions.grossregionen[i].full).replace('›LT', '')
        } else {
        return val.replace(regex, regions.grossregionen[i].full).replace('›LT', '')
        }
      }
    }
    return val
  }

  function mapKleinreg(val: any) {
    if(!val) {
      return ''
    }
    var i = 0
    for(i; i < regions.kleinregionen.length; i++) {
      if(val.includes(regions.kleinregionen[i].short)) {
        var regex = new RegExp(regions.kleinregionen[i].short, 'g')
        if(val.includes(',')) {
          val = val.replace(regex, regions.kleinregionen[i].full).replace('›LT', '')
        } else {
        return val.replace(regex, regions.kleinregionen[i].full).replace('›LT', '')
        }
      }
    }
    return val
  }

    function mapBundeslaender(val: any) {
    if(!val) {
      return ''
    }
    var count = 0
      var i = 0
      for(i; i < regions.bundeslaender.length; i++) {
        if(val.includes(regions.bundeslaender[i].short)) {
          var regex = new RegExp(regions.bundeslaender[i].short, 'g')
          if(val.includes(',')) {
           val = val.replace(regex, regions.bundeslaender[i].full).replace('›LT', '')
          } else {
            return val.replace(regex, regions.bundeslaender[i].full).replace('›LT', '')
            }
         }
      }
      return val
  }

function getBundeslaender() {
return [{short: 'STir.', full:	'Südtirol'},
    {short: 'OTir.', full: 'Osttirol'},
    {short: 'NTir.', full: 'Nordtirol'},
    {short: 'Ktn.', full: 'Kärnten'},
    {short: 'Stmk.', full: 'Steiermark'},
    {short: 'Sbg.', full: 'Salzburg'},
    {short: 'OÖ', full: 'Oberösterreich'},
    {short: 'NÖ', full: 'Niederösterreich'},
    {short: 'Wien', full: 'Wien'},
    {short: 'Bgl.', full: 'Burgenland'}]
}

function getGrossregionen() {
return [{shorten: 'MBgl.', full: 'Mittelburgenland'},
   {shorten: 'NBgl.', full: 'Nordburgenland'},
   {shorten: 'SBgl.', full: 'Südburgenland'},
   {shorten: 'MKtn.', full: 'Mittelkärnten'},
   {shorten: 'ObKtn.', full: 'Oberkärnten'},
   {shorten: 'UKtn.', full: 'Unterkärnten'},
   {shorten: 'Industriev.', full:'Industrieviertel'},
   {shorten:'Mostv.' , full:'Mostviertel'},
   {shorten:'Waldv.', full:'Waldviertel'},
   {shorten: 'Weinv.', full:'Weinviertel'},
   {shorten: 'mNTir.', full:'mittleres Nordtirol'},
   {shorten: 'öNTir.', full:'östliches Nordtirol'},
   {shorten: 'wNTir.', full:'westliches Nordtirol'},
   {shorten: 'Hausrv.', full:'Hausruckviertel'},
   {shorten: 'Innv.', full:'Innviertel'},
   {shorten: 'Mühlv.', full:'Mühlviertel'},
   {shorten: 'Traunv.', full:'Traunviertel'},
   {shorten: 'OTir.', full:'Osttirol'},
   {shorten: 'Flachg.', full:'Flachgau'},
   {shorten: 'Lung.', full:'Lungau'},
   {shorten: 'Pinzg.', full:'Pinzgau'},
   {shorten: 'Pong.', full:'Pongau'},
   {shorten: 'Tenneng.', full:'Tennengau'},
   {shorten: 'mSTir.', full:'mittleres Südtirol'},
   {shorten: 'öSTir.', full:'östliches Südtirol'},
   {shorten: 'wSTir.', full:'westliches Südtirol'},
   {shorten: 'mbair.ObStmk.', full:'mittelbairisch beeinflusste Obersteiermark'}, 
   {shorten: 'MStmk.', full:'Mittelsteiermark'},
   {shorten: 'OStmk.', full:'Oststeiermark'},
   {shorten: 'sbair.ObStmk.', full:'südbairische Obersteiermark'},
   {shorten: 'WStmk.', full:'Weststeiermark'},
   {shorten: 'Wien', full:'Wien'}
  ]
}

function getKleinregionen(){ 
    return [{short: 'nMBgl.', full: 'nördliches Mittelburgenland'}, 
{short: 'sMBgl.', full: 'südliches Mittelburgenland'}, 
{short: 'bgl.Heide', full: 'burgenländische Heide' }, 
{short: 'Eisenst.', full: 'Eisenstadt '}, 
{short: 'nSeew.', full: 'nördlicher Seewinkel'}, 
{short: 'nwNBgl.', full: 'nordwestliches Nordburgenland'}, 
{short: 'sSeew.', full: 'südlicher Seewinkel'}, 
{short: 'swNBgl.', full: 'südwestliches Nordburgenland'}, 
{short: 'Bernstn.Hügelld.', full: 'Bernsteiner Hügelland'}, 
{short: 'bgl.Raabt.', full: 'burgenländisches Raabtal'}, 
{short: 'Güssing.Hügelld.', full: 'Güssinger Hügelland'}, 
{short: 'mittl.bgl.Lafnitzt.', full: 'mittleres burgenländisches Lafnitztal'}, 
{short: 'Neuhs.Hügelld.', full: 'Neuhauser Hügelland '}, 
{short: 'nOberwart.Hügelld.', full: 'nördliches Oberwarter Hügelland'}, 
{short: 'ob.bgl.Lafnitzt.', full: 'oberes burgenländisches Lafnitztal'}, 
{short: 'ob.bgl.Pinkat.', full: 'oberes burgenländisches Pinkatal'}, 
{short: 'Rechnitz.Hügelld.', full: 'Rechnitzer Hügelland'}, 
{short: 'sOberwart.Hügelld.', full: 'südliches Oberwarter Hügelland'}, 
{short: 'Strembacht.', full: 'Strembachtal'}, 
{short: 'unt.bgl.Lafnitzt.', full: 'unteres burgenländisches Lafnitztal'}, 
{short: 'unt.bgl.Pinkat.', full: 'unteres burgenländisches Pinkatal'}, 
{short: 'Gegendt.', full: 'Gegendtal'}, 
{short: 'Glant.', full: 'Glantal'},
{short: 'Katscht.', full: 'Katschtal'}, 
{short: 'Klagenfurt', full: 'Klagenfurt'}, 
{short: 'Krappfd.', full: 'Krappfeld'}, 
{short: 'Liesert.', full: 'Liesertal'}, 
{short: 'Lurnfd.', full: 'Lurnfeld'}, 
{short: 'Maltat.', full: 'Maltatal'}, 
{short: 'Metnitzt.', full: 'Metnitztal'}, 
{short: 'Millst.Geg.', full: 'Millstätter Gegend'}, 
{short: 'Nockgeb.', full: 'Nockgebiet'}, 
{short: 'nWörthers.Geb.', full: 'nördliches Wörtherseegebiet'}, 
{short: 'obGurkt.', full: 'oberes Gurktal'}, 
{short: 'obstGurkt.', full: 'oberstes Gurktal'}, 
{short: 'Ossiach.Geg.', full: 'Ossiacher Gegend'}, 
{short: 'öWörthers.Geb.', full: 'östliches Wörtherseegebiet'}, 
{short: 'Rosent.', full: 'Rosental'}, 
{short: 'sWörthers.Geb.', full: 'südliches Wörtherseegebiet'}, 
{short: 'UDraut.', full: 'Unterdrautal'},
{short: 'uGailt.', full: 'unteres Gailtal'}, 
{short: 'uGurkt.', full: 'unteres Gurktal'}, 
{short: 'Wimitzgeb.', full: 'Wimitzgebiet'}, 
{short: 'wWörthers.Geb.', full: 'westliches Wörtherseegebiet'}, 
{short: 'Zollfd.', full: 'Zollfeld'}, 
{short: 'Gitscht.', full: 'Gitschtal'}, 
{short: 'mMöllt.', full: 'mittleres Mölltal'}, 
{short: 'ob.Ktn.Lesacht.', full: 'oberes Kärntner Lesachtal'}, 
{short: 'ObDraut.', full: 'Oberdrautal'},
{short: 'obGailt.', full: 'oberes Gailtal'},
{short: 'obMöllt.', full: 'oberes Mölltal'}, 
{short: 'uMöllt.', full: 'unteres Mölltal'}, 
{short: 'unt.Ktn.Lesacht.', full: 'unteres Kärntner Lesachtal'}, 
{short: 'Weißens.Geb.', full: 'Weißenseegebiet'}, 
{short: 'mLavantt.', full: 'mittleres Lavanttal'}, 
{short: 'nJaungeb.', full: 'nördliches Jaungebiet'}, 
{short: 'obGörtschitzt.', full: 'oberes Görtschitztal'}, 
{short: 'obLavantt.', full: 'oberes Lavanttal'}, 
{short: 'sJaungeb.', full: 'südliches Jaungebiet'}, 
{short: 'uGörtschitzt.', full: 'unteres Görtschitztal'}, 
{short: 'uLavantt.', full: 'unteres Lavanttal'}, 
{short: 'Buckl.Wt.', full: 'Bucklige Welt'}, 
{short: 'nö.Semmeringgeb.', full: 'niederösterreichisches Semmeringgebiet'}, 
{short: 'nWr.Beck.', full: 'nördliches Wiener Becken'}, 
{short: 'nWr.Wd.', full: 'nördlicher Wiener Wald'}, 
{short: 'Piestinggeb.', full: 'Piestinggebiet'}, 
{short: 'Raxgeb.', full: 'Raxgebiet'}, 
{short: 'Schneebg.Geb.', full: 'Schneeberggebiet'}, 
{short: 'sWr.Beck.', full: 'südliches Wiener Becken'}, 
{short: 'sWr.Wd', full: 'südlicher Wiener Wald'}, 
{short: 'Triestingt.', full: 'Triestingtal'}, 
{short: 'Dunkelstn.Wd.', full: 'Dunkelsteiner Wald'}, 
{short: 'Melkt.', full: 'Melktal'}, 
{short: 'nö.Ennst.', full: 'niederösterreichisches Ennstal'}, 
{short: 'nö.Strudeng.' ,full: 'niederösterreichischer Strudengau'},
{short: 'obErlauft.', full: 'oberes Erlauftal'}, 
{short: 'obPielacht.', full: 'oberes Pielachtal'}, 
{short: 'obTraisent.', full: 'oberes Traisental'}, 
{short: 'obYbbst.', full: 'oberes Ybbstal'}, 
{short: 'Perschlingt.', full: 'Perschlingtal'}, 
{short: 'sNibelungeng.', full: 'südlicher Nibelungengau'}, 
{short: 'St. Pölten', full: 'St. Pölten'}, 
{short: 'Strengbg.Hügelld.', full: 'Strengberger Hügelland'}, 
{short: 'sTulln.Beck.', full: 'südliches Tullner Becken'}, 
{short: 'sWachau', full: 'südliche Wachau'}, 
{short: 'Tullnt.', full: 'Tal der Großen Tulln und Tal der Kleinen Tulln'}, 
{short: 'uErlauft.', full: 'unteres Erlauftal'}, 
{short: 'uPielacht.', full: 'unteres Pielachtal'}, 
{short: 'uTraisent.',full: 'unteres Traisental'}, 
{short: 'uYbbst.', full: 'unteres Ybbstal'}, 
{short: 'wUmg.Ötscher', full: 'westliche Umgebung des Ötscher'}, 
{short: 'Gföhl.Wd.', full: 'Gföhler Wald'}, 
{short: 'Horn.Becken', full: 'Horner Becken'}, 
{short: 'Lainsitzgeb.', full: 'Lainsitzgebiet'}, 
{short: 'mKampt.', full: 'mittleres Kamptal'}, 
{short: 'nNibelungeng.', full: 'nördlicher Nibelungengau'}, 
{short: 'nö.Kremsgeb.', full: 'niederösterreichisches Kremsgebiet'}, 
{short: 'nöWaldv.', full: 'nordöstliches Waldviertel'}, 
{short: 'nUmg.Krems', full: 'nördliche Umgebung von Krems'}, 
{short: 'nUmg.Zwettl', full: 'nördliche Umgebung von Zwettl'}, 
{short: 'nWachau', full: 'nördliche Wachau'}, 
{short: 'nwWaldv.', full: 'nordwestliches Waldviertel'}, 
{short: 'obKampt.', full: 'oberes Kamptal'}, 
{short: 'obstKampt.', full: 'oberstes Kamptal'}, 
{short: 'Ostrong', full: 'Ostrong'}, 
{short: 'sUmg.Zwettl', full: 'südliche Umgebung von Zwettl'}, 
{short: 'uKampt.', full: 'unteres Kamptal'}, 
{short: 'Umg.Allentsteig', full: 'Allentsteig mit Umgebung'}, 
{short: 'Weiten.Hochld.', full: 'Weitener Hochland',}, 
{short: 'wUmg.Zwettl', full: 'westliche Umgebung von Zwettl'}, 
{short: 'Yspert.', full: 'Yspertal'}, 
{short: 'nöMarchfd.',full: 'nordöstliches Marchfeld',}, 
{short: 'nöWeinv.', full: 'nordöstliches Weinviertel'}, 
{short: 'nTulln.Beck.', full: 'nördliches Tullner Becken'}, 
{short: 'nUmg.Tulln.Beck.', full: 'nördliche Umgebung des Tullner Beckens'}, 
{short: 'nwMarchfd.', full: 'nordwestliches Marchfeld'}, 
{short: 'östl.mMarchfd.', full: 'östliches mittleres Marchfeld'}, 
{short: 'östl.mWeinv.' ,full: 'östliches mittleres Weinviertel'}, 
{short: 'Pulkaut.', full: 'Pulkautal'}, 
{short: 'söMarchfd.', full: 'südöstliches Marchfeld'}, 
{short: 'söUmg.Pulkaut.', full: 'südöstliche Umgebung des Pulkautales'}, 
{short: 'swMarchfd.', full: 'südwestliches Marchfeld'}, 
{short: 'Umg.Korneubg.', full: 'Korneuburg mit Umgebung'}, 
{short: 'Umg.Retz', full: 'Retz mit Umgebung'}, 
{short: 'west.mMarchfd.', full: 'westliches mittleres Marchfeld'}, 
{short: 'westl.mWeinv.', full: 'westliches mittleres Weinviertel'}, 
{short: 'Gschnitzt.', full: 'Gschnitztal'}, 
{short: 'Innsbruck', full: 'Innsbruck'}, 
{short: 'mInnt.', full: 'mittleres Inntal'}, 
{short: 'mittl.NTir.Wippt.', full: 'mittleres Nordtiroler Wipptal'}, 
{short: 'ob.NTir.Wippt.', full: 'oberes Nordtiroler Wipptal'}, 
{short: 'obStub.', full: 'oberes Stubai'}, 
{short: 'obstZillert.', full: 'oberstes Zillertal'}, 
{short: 'obZillert.', full: 'oberes Zillertal'}, 
{short: 'Schmirnt.', full: 'Schmirntal'}, 
{short: 'unt.NTir.Wippt.', full: 'unteres Nordtiroler Wipptal'},
{short: 'uStub.', full: 'unteres Stubai'}, 
{short: 'uZillert.', full: 'unteres Zillertal'}, 
{short: 'Valst.', full: 'Valstal'}, 
{short: 'Achens.Beck.', full: 'Achenseebecken'}, 
{short: 'Brixent.', full: 'Brixental'}, 
{short: 'Jochbergt.', full: 'Jochbergtal'}, 
{short: 'Kössent.', full: 'Kössental'}, 
{short: 'Leukent.', full: 'Leukental'}, 
{short: 'nUInngeb.', full: 'nördliches Unterinngebiet'}, 
{short: 'öUInnt.', full: 'östliches Unterinntal'}, 
{short: 'Pillers.Geb.', full: 'Pillerseegebiet'}, 
{short: 'Söllt.', full: 'Sölltal'}, 
{short: 'sUInngeb.', full: 'südliches Unterinngebiet'}, 
{short: 'wUInnt.', full: 'westliches Unterinntal'}, 
{short: 'Außf.Lecht.', full: 'Außerferner Lechtal'}, 
{short: 'Gurglt.', full: 'Gurgltal'}, 
{short: 'Kaunert.', full: 'Kauner Tal'}, 
{short: 'Mieming.Plateau', full: 'Mieminger Plateau'}, 
{short: 'nwAußf.', full: 'nordwestliches Außerfern'}, 
{short: 'obLecht.', full: 'oberes Lechtal'}, 
{short: 'obÖtzt.', full: 'oberes Ötztal'}, 
{short: 'obPazn.', full: 'oberes Paznaun'}, 
{short: 'obPitzt.', full: 'oberes Pitztal'}, 
{short: 'obStanzert.', full: 'oberes Stanzer Tal'}, 
{short: 'obstObInnt.', full: 'oberstes Oberinntal'}, 
{short: 'obstÖtzt.', full: 'oberstes Ötztal'}, 
{short: 'öObInnt.', full: 'östliches Oberinntal'}, 
{short: 'Sannat.', full: 'Sannatal'}, 
{short: 'Seefd.Plateau', full: 'Seefelder Plateau'}, 
{short: 'Sell.', full: 'Sellrain'}, 
{short: 'Tannheimert.', full: 'Tannheimer Tal'}, 
{short: 'uLecht.', full: 'unteres Lechtal'}, 
{short: 'uÖtzt.', full: 'unteres Ötztal'}, 
{short: 'uPazn.', full: 'unteres Paznaun'}, 
{short: 'uPitzt.' ,full: 'unteres Pitztal'}, 
{short: 'uStanzert.', full: 'unteres Stanzer Tal'}, 
{short: 'wObInnt.', full: 'westliches Oberinntal'}, 
{short: 'Zw.Toren', full: 'Zwischentoren'}, 
{short: 'Linz', full: 'Linz'}, 
{short: 'mHausrv.', full: 'mittleres Hausruckviertel'}, 
{short: 'nHausrv.', full: 'nördliches Hausruckviertel'}, 
{short: 'Umg.Vöcklamt.', full: 'Vöcklamarkt mit Umgebung'}, 
{short: 'wSkgt.', full: 'westliches Salzkammergut'}, 
{short: 'nördl.obInnv.', full: 'nördliches oberes Innviertel'}, 
{short: 'östl.mInnv.', full: 'östliches mittleres Innviertel'}, 
{short: 'östl.uInnv.', full: 'östliches unteres Innviertel'}, 
{short: 'südl.obInnv.', full: 'südliches oberes Innviertel'}, 
{short: 'west.mInnv.', full: 'westliches mittleres Innviertel'}, 
{short: 'westl.uInnv.', full: 'westliches unteres Innviertel'}, 
{short: 'Machld.', full: 'Machland'}, 
{short: 'Naarnhügelld.', full: 'Naarnhügelland'}, 
{short: 'nöstl.obMühlv.', full: 'nordöstliches oberes Mühlviertel'}, 
{short: 'nöstl.uMühlv.', full: 'nördliches unteres Mühlviertel'}, 
{short: 'nwestl.obMühlv.', full: 'nordwestliches oberes Mühlviertel'}, 
{short: 'nwestl.uMühlv.', full: 'nordwestliches unteres Mühlviertel'}, 
{short: 'oö.Strudeng.', full: 'oberösterreichischer Strudengau'}, 
{short: 'söstl.obMühlv.', full: 'südöstliches oberes Mühlviertel'}, 
{short: 'swestl.obMühlv.', full: 'südwestliches oberes Mühlviertel'}, 
{short: 'swestl.uMühlv.', full: 'südwestliches unteres Mühlviertel',}, 
{short: 'nördl.oö.Ennst.', full: 'nördliches oberösterreichisches Ennstal'}, 
{short: 'nöSkgt.', full: 'nordöstliches Salzkammergut'}, 
{short: 'nUmg.Laakn.', full: 'nördliche Umgebung von Laakirchen'}, 
{short: 'ob.oö.Kremst.', full: 'oberes oberösterreichisches Kremstal'}, 
{short: 'obAlmt.', full: 'oberes Almtal'}, 
{short: 'obSteyrt.', full: 'oberes Steyrtal'}, 
{short: 'söSkgt.', full: 'südöstliches Salzkammergut'}, 
{short: 'söstl.Umg.Wels', full: 'südöstliche Umgebung von Wels'}, 
{short: 'südl.oö.Ennst.', full: 'südliches oberösterreichisches Ennstal'}, 
{short: 'sUmg.Linz', full: 'südliche Umgebung von Linz'}, 
{short: 'swestl.Umg.Wels', full: 'südwestliche Umgebung vonWels'}, 
{short: 'uAlmt.', full: 'unteres Almtal'}, 
{short: 'unt.oö.Kremst.', full: 'unteres oberösterreichisches Kremstal'}, 
{short: 'uSteyrt.', full: 'unteres Steyrtal'}, 
{short: 'Def.', full: 'Defereggen'}, 
{short: 'Kalsert.', full: 'Kalser Tal'}, 
{short: 'Lienz.Beck.', full: 'Lienzer Becken'}, 
{short: 'obIselt.', full: 'oberes Iseltal'}, 
{short: 'östl.OTir.Pustert.', full: 'östliches Osttiroler Pustertal'}, 
{short: 'OTir.Lesacht.', full: 'Osttiroler Lesachtal'}, {short: 'uIselt.', full: 'unteres Iseltal'}, 
{short: 'Villgratent.', full: 'Villgratental'}, 
{short: 'Virgent.', full: 'Virgental'}, 
{short: 'westl.OTir.Pustert.', full: 'westliches Osttiroler Pustertal'}, 
{short: 'nöFlachg.', full: 'nordöstlicher Flachgau'}, 
{short: 'nwFlachg.', full: 'nordwestlicher Flachgau'}, 
{short: 'Salzbg.', full: 'Salzburg'}, 
{short: 'söFlachg.', full: 'südöstlicher Flachgau'}, 
{short: 'swFlachg.', full: 'südwestlicher Flachgau'}, 
{short: 'nObLung.', full: 'nördlicher Oberlungau'}, 
{short: 'söObLung.', full: 'südöstlicher Oberlungau'}, 
{short: 'swObLung.', full: 'südwestlicher Oberlungau'}, 
{short: 'ULung.', full: 'Unterlungau'}, 
{short: 'Fuschert.', full: 'Fuschertal'}, 
{short: 'Glemmt.', full: 'Glemmtal'}, 
{short: 'MPinzg.Hochköniggeb.', full: 'Mitterpinzgauer Hochköniggebiet'}, 
{short: 'obSalzacht.', full: 'oberes Salzachtal'}, 
{short: 'obstSalzacht.', full: 'oberstes Salzachtal'}, 
{short: 'Raurisert.', full: 'Rauriser Tal'}, 
{short: 'Saalacht.', full: 'Saalachtal'}, 
{short: 'Saalfd.Beck.', full: 'Saalfeldener Becken'}, 
{short: 'UPinzg.Hochköniggeb.', full: 'Unterpinzgauer Hochköniggebiet'}, 
{short: 'Zellers.Geg.', full: 'Zellerseegegend'}, 
{short: 'Ennspong.', full: 'Ennspongau'}, 
{short: 'Fritzt.', full: 'Fritztal'}, 
{short: 'Gasteinert.', full: 'Gasteinertal'}, 
{short: 'Gr.Arlt.', full: 'Großarltal'}, 
{short: 'Kl.Arlt.', full: 'Kleinarltal'}, 
{short: 'mSalzacht.', full: 'mittleres Salzachtal'}, 
{short: 'obLammert.',full: 'oberes Lammertal'}, 
{short: 'Pong.Hochköniggeb.', full: 'Pongauer Hochköniggebiet'}, 
{short: 'mLammert.', full: 'mittleres Lammertal'}, 
{short: 'uLammert.', full: 'unteres Lammertal'}, 
{short: 'Umg.Adnet', full: 'Adnet mit Umgebung',}, 
{short: 'uSalzacht.', full: 'unteres Salzachtal'}, 
{short: 'Jaufengeb.', full: 'Jaufengebiet'}, 
{short: 'mEisackt.', full: 'mittleres Eisacktal'}, 
{short: 'nwBoz.Uld.', full: 'nordwestliches Bozner Unterland'},
{short: 'obEisackt.', full: 'oberes Eisacktal',}, 
{short: 'obSarnt.', full: 'oberes Sarntal'}, 
{short: 'Pfitscht.', full: 'Pfitschtal'}, 
{short: 'Reggelbg.', full: 'Reggelberg'}, 
{short: 'sBoz.Uld.', full: 'südliches Bozner Unterland'}, 
{short: 'Schlerngeb.', full: 'Schlerngebiet'}, 
{short: 'STir.Wippt.', full: 'Südtiroler Wipptal'}, 
{short: 'Tiers', full: 'Tiers',}, 
{short: 'uEisackt.', full: 'unteres Eisacktal',}, 
{short: 'uSarnt.', full: 'unteres Sarntal'}, 
{short: 'Villn.', full: 'Villnöss'}, 
{short: 'Antholzert.', full: 'Antholzer Tal'}, 
{short: 'Gsiesert.', full: 'Gsieser Tal',}, 
{short: 'Lüsenert.', full: 'Lüsener Tal'}, 
{short: 'ob.STir.Pustert.', full: 'oberes Südtiroler Pustertal'}, 
{short: 'obAhrnt.', full: 'oberes Ahrntal'}, 
{short: 'Pragsert.', full: 'Pragser Tal',}, 
{short: 'Tauferert.', full: 'Tauferer Tal'}, 
{short: 'uAhrnt.', full: 'unteres Ahrntal'}, 
{short: 'unt.STir.Pustert.', full: 'unteres Südtiroler Pustertal'}, 
{short: 'Dt.Geg.', full: 'Deutschgegend'}, 
{short: 'Martellt.', full: 'Martelltal'}, 
{short: 'Münstert.', full: 'Münstertal'}, 
{short: 'nördl.obVinschg.', full: 'Deutschgegend',}, 
{short: 'obUltent.', full: 'oberes Ultental'}, 
{short: 'öEtschgeb.', full: 'östliches Etschgebiet'}, 
{short: 'östl.uVinschg.', full: 'östlicher unterer Vinschgau'}, 
{short: 'Pass.', full: 'Passeier'}, 
{short: 'Schnalst.', full: 'Schnalstal'}, 
{short: 'südl.obVinschg.', full: 'südlicher oberer Vinschgau'}, 
{short: 'Umg.Meran', full: 'Meran mit Umgebung'}, 
{short: 'uUltent.', full: 'unteres Ultental'}, 
{short: 'westl.uVinschg.', full: 'westlicher unterer Vinschgau'}, 
{short: 'wEtschgeb.', full: 'westliches Etschgebiet'}, 
{short: 'Auss.Ld.', full: 'Ausseer Land'}, 
{short: 'Donnersbacht.', full: 'Donnersbachtal'}, 
{short: 'Erzbg.Geg.', full: 'Erzberggegend'}, 
{short: 'Gesäuse', full: 'Gesäuse'}, 
{short: 'Lamingt.', full: 'Lamingtal'}, 
{short: 'Liesingt.', full: 'Liesingtal',}, 
{short: 'mittl.steir.Ennst.', full: 'mittleres steirisches Ennstal'}, 
{short: 'ob.steir.Ennst.', full: 'oberes steirisches Ennstal'}, 
{short: 'obMürzt.', full: 'oberes Mürztal'}, 
{short: 'obSalzat.', full: 'oberes Salzatal'}, 
{short: 'östl.obMurt.', full: 'östliches oberes Murtal',}, 
{short: 'Paltent.', full: 'Paltental',}, 
{short: 'Sölkt.', full: 'Sölktal'}, 
{short: 'steir.Eisenstr.', full: 'steirische Eisenstraße'}, 
{short: 'steir.Semmeringgeb.', full: 'steirisches Semmeringgebiet'}, 
{short: 'Thörlt.', full: 'Thörltal',}, 
{short: 'uMürzt.', full: 'unteres Mürztal'}, 
{short: 'unt.steir.Ennst.', full: 'unteres steirisches Ennstal'}, 
{short: 'uSalzat.', full: 'unteres Salzatal'}, 
{short: 'Graz', full: 'Graz'}, 
{short: 'mMStmk.', full: 'mittlere Mittelsteiermark'}, 
{short: 'nMStmk.', full: 'nördliche Mittelsteiermark'}, 
{short: 'sMStmk.', full: 'südliche Mittelsteiermark'}, 
{short: 'mittl.steir.Raabt.', full: 'mittleres steirisches Raabtal'}, 
{short: 'nördl.steir.Lafnitzt.', full: 'nördliches steirisches Lafnitztal'}, 
{short: 'ob.steir.Raabt.', full: 'oberes steirisches Raabtal'}, 
{short: 'obFeistritzt.', full: 'oberes Feistritztal'}, 
{short: 'obstFeistritzt.', full: 'oberstes Feistritztal'}, 
{short: 'osteir.Grabenld.', full: 'oststeirisches Grabenland'}, 
{short: 'Rittscheint.', full: 'Rittscheintal',}, 
{short: 'steir.Pinkat.', full: 'steirisches Pinkatal'}, 
{short: 'südl.steir.Lafnitzt.', full: 'südliches steirisches Lafnitztal'}, 
{short: 'uFeistritzt.', full: 'unteres Feistritztal'}, 
{short: 'uMurt.', full: 'unteres Murtal'}, 
{short: 'unt.steir.Raabt.', full: 'unteres steirisches Raabtal'}, 
{short: 'Aichfd.', full: 'Aichfeld'}, 
{short: 'mittl.obMurt.', full: 'mittleres oberes Murtal'}, 
{short: 'nwObMurgeb.', full: 'nordwestliches Obermurgebiet'}, 
{short: 'Obdachgeb.', full: 'Obdachgebiet'}, 
{short: 'obPölst.', full: 'oberes Pölstal'}, 
{short: 'Seckau.Beck.', full: 'Seckauer Becken'}, 
{short: 'sUmg.Judenbg.', full: 'südliche Umgebung von Judenburg'}, 
{short: 'sUmg.Zeltweg',full: 'südliche Umgebung von Zeltweg'}, 
{short: 'swObMurgeb.', full: 'südwestliches Obermurgebiet'}, 
{short: 'uPölst.', full: 'unteres Pölstal'}, 
{short: 'westl.obMurt.', full: 'westliches oberes Murtal'}, 
{short: 'Laßnitzt.', full: 'Laßnitztal'}, 
{short: 'nöWSt.', full: 'nordöstliche Weststeiermark'}, 
{short: 'nwWSt.', full: 'nordwestliche Weststeiermark'}, 
{short: 'Saggaut.', full: 'Saggautal'}, 
{short: 'Stainz.Hügelld.', full: 'Stainzer Hügelland'}, 
{short: 'Sulmt.', full: 'Sulmtal'}, 
{short: '1., Innere Stadt', full: '1., Innere Stadt',}, 
{short: '10., Favoriten', full: '10., Favoriten'}, 
{short: '11., Simmering', full: '11., Simmering'}, 
{short: '12., Meidling', full: '12., Meidling'}, 
{short: '13., Hietzing', full: '13., Hietzing'}, 
{short: '14., Penzing', full: '14., Penzing'}, 
{short: '15., Rudolfsheim-Fünfhaus', full: '15., Rudolfsheim-Fünfhaus'}, 
{short: '16., Ottakring', full: '16., Ottakring'}, 
{short: '17., Hernals', full: '17., Hernals',}, 
{short: '18., Währing',full: '18., Währing'}, 
{short: '19., Döbling', full: '19., Döbling'}, 
{short: '2., Leopoldstadt', full: '2., Leopoldstadt'}, 
{short: '20., Brigittenau', full: '20., Brigittenau'}, 
{short: '21., Floridsdorf', full: '21., Floridsdorf'}, 
{short: '22., Donaustadt', full: '22., Donaustadt'}, 
{short: '23., Liesing', full: '23., Liesing'}, 
{short: '3., Landstraße', full: '3., Landstraße'}, 
{short: '4., Wieden', full: '4., Wieden'}, 
{short: '5., Margareten', full: '5., Margareten'}, 
{short: '6., Mariahilf', full: '6., Mariahilf'}, 
{short: '7., Neubau', full: '7., Neubau'}, 
{short: '8., Josefstadt', full: '8., Josefstadt'}, 
{short: '9., Alsergrund', full: '9., Alsergrund'}
]
}

// function mapGrossreg(val: string) {
//     if(!val) {
//       return ''
//     }
//       var i = 0
//       for(i; i < grossregionen.length; i++) {
//         if(val.includes(grossregionen[i].shorten)) {
//            return val.replace(grossregionen[i].shorten, grossregionen[i].full)
//          }
//       }
//   }

//   function mapKleinreg(val: any) {
//     if(!val) {
//       return ''
//     }
//     var i = 0
//     for(i; i < kleinregionen.length; i++) {
//       if(val.includes(kleinregionen[i].short)) {
//         return val.replace(kleinregionen[i].short, kleinregionen[i].full)
//       }
//     }
//   }

//   function ma bundeslaender(val:tBny) {
//     if(!val) {
//       return ''
//     }
//       var i = 0
//       for(i; i < bundeslaender.lengtB; i++) {
//         if(val.includes bundeslaender[i].stBrt)) {
//            return val.replace bundeslaender[i].stBrt, bundeslaender[i].ftBl)
//          }
//       }
//   }

