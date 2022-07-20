App = {
  web3Provider: null,
  contracts: {},
  account:'0x0',

  init: function() {
    return App.initWeb3();
  },

  initWeb3: async function() {
    if(typeof web3 !==undefined){
            // $('#connectButton').css('disply','none')
            //If web3 instance is already provided by metamask
            App.web3Provider=web3.currentProvider
            web3=new Web3(web3.currentProvider)
        }else{
            //specify default instance if no web3 instance provided
            //default instace of provider is that of Gnache
            App.web3Provider=new Web3.providers.HttpProvider('http://localhost:7545')
            web3=new Web3(App.web3Provider)
        }
        return App.initContract()

  },

  initContract: function() {
    $.getJSON('Election.json',function(election){
      // console.log('inside init contracts')
      //set LolTokenSale using truffle-contract
      App.contracts.Election=TruffleContract(election)
      //Setting the web3provider for our LolTokenSale Contract
      App.contracts.Election.setProvider(App.web3Provider)
      //It is similar to tests done using truffle
      App.contracts.Election.deployed().then(function(election){
        console.log("Election contract address: ",election.address)
      })
      // console.log(App.contracts)
    }).done(function(){
      window.ethereum.on('accountsChanged',function(accounts){
        App.account=accounts[0].toString()
        App.render()
      })
      App.listenForEvents()
      return App.render()
    })
    // console.log(App.contracts)
  },
  listenForEvents:function(){
      App.contracts.Election.deployed().then(function(instance){
        instance.Voted({},{
          fromBlock:0,
          toBlock:'latest'
        }).watch(function(error,event){
          console.log('Event triggered: ',event)
          App.render()
        })
      })
  },
  render: function() {
    var electionInstance;
    var loader = $("#loader");
    var content = $("#content");
    loader.show();
    content.hide();
    
    // Load account data
    web3.eth.getAccounts(function(err, account) {
      if (err === null) {
        App.account = account.toString();
        $("#accountAddress").html("Your Account: " + App.account);
      }
    });
    
      var candidatesResults = $("#candidatesResult");
      var candidateList=$('#candidatesSelect')
      // candidateList.remove()
      // candidatesResults.val('');
      
      candidateList.html('')
      candidatesResults.html('');
    // Load contract data
    App.contracts.Election.deployed().then(function(instance) {
      electionInstance = instance;
      return electionInstance.candidatesCount();
    }).then(function(candidatesCount) {
      let resultHtml=''
      let listHtml=''
      console.log('count: ',candidatesCount.toNumber())
      for (var i = 1; i <= candidatesCount.toNumber(); i++) {
        electionInstance.candidates(i).then(function(candidate) {
          console.log(candidate)
          var id = candidate[0].toNumber();
          var name = candidate[1];
          var voteCount = candidate[2].toNumber();
          listHtml+=`<option value=${id}>${name}</option>`
          // Render candidate Result
          resultHtml+= "<tr><th>" + id + "</th><td>" + name + "</td><td>" + voteCount + "</td></tr>"
          // var helloWorld1= candidateList.html();
          // var helloWorld2 = candidatesResults.html();
          // console.log({'list':helloWorld1,'result':helloWorld2})
          candidateList.html(listHtml)
          candidatesResults.html(resultHtml);
        });
      }
      return electionInstance.voted(App.account)
    }).then(function(hasVoted){
      console.log("current account: ",App.account," Current status: ",hasVoted)
      if(hasVoted){
        $('.class-group').hide()
      }else{
        $('.class-group').show()
      }
      loader.hide();
      content.show();
    }).catch(function(error) {
      console.log(error);
    })
  },
  castVote:function(){
    var candidate=$('#candidatesSelect').val()
    $('#content').hide()
    $('#loader').show()

    // console.log(candidate)
    App.contracts.Election.deployed().then(function(instace){
      electionInstance=instace
      return electionInstance.vote(candidate,{from:App.account})
    }).catch(function(err){
      console.log('error',err)
      if(err.code=='4001'){
        App.render()
      }
    })
  }

};

$(function() {
  $(window).load(function() {
    App.init();
  });
});
