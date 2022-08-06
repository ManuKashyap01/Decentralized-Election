const Election=artifacts.require('./Election.sol')

contract('Election',function(accounts){
    it('tests the initialization of candidates',function(){
        return Election.deployed().then(function(instance){
            return instance.candidatesCount();
        }).then(function(num){
            assert.equal(num.toNumber(),2,'The contract was not initialized correctly')
        })
    })
    it('tests the candidates are initialized with correct details',function(){
        return Election.deployed().then(function(instance){
            election=instance
            return election.candidates(1)
        }).then(function(cand1){
            assert.equal(cand1.id.toNumber(),1,'Candidate id is different')
            assert.equal(cand1.name,'Candidate 1','Candidate name is different')
            assert.equal(cand1.voteCount.toNumber(),0,'Candidate Vote count is different')
            
            return election.candidates(2)
        }).then(function(cand2){
            assert.equal(cand2.id.toNumber(),2,'Candidate id is different')
            assert.equal(cand2.name,'Candidate 2','Candidate name is different')
            assert.equal(cand2.voteCount.toNumber(),0,'Candidate Vote count is different')
        })
    })
    it('checks for a successfull vote',function(){
        return Election.deployed().then(function(instance){
            election=instance
            return election.vote(2)
        }).then(function(receipt){
            assert.equal(receipt.logs.length,1,'Event is triggered')
            assert.equal(receipt.logs[0].event,'Voted','Voted event is called')
            assert.equal(receipt.logs[0].args._candidateId.toNumber(),'2','Candidate id is different')
            return election.candidates(2)
        }).then(function(cand2){
            assert.equal(cand2[2].toNumber(),1,'Vote was not casted')
        })  
    })
    it('checks for invalid vote',function(){
        return Election.deployed().then(function(instance){
            election=instance
            return election.vote(99,{from:accounts[1]})
        }).then(assert.fail).catch(function(error){
            assert(error.message.toString().indexOf('revert')>=0,'Invalid vote casted')
        })
    })
    it('checks for double voting',function(){
        return Election.deployed().then(function(instance){
            election=instance
            return election.vote(1,{from:accounts[2]})
        }).then(function(receipt){
            return election.vote(1,{from:accounts[2]})
        }).then(assert.fail).catch(function(error){
            assert(error.message.toString().indexOf('revert')>=0,'Double vote casted')
        })
    })
})