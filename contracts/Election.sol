// SPDX-License-Identifier: MIT
pragma solidity >=0.4.2;
contract Election{
    //Describing the candidate
    struct Candidate{
        uint id;
        string name;
        uint voteCount;
    }
    //mapping id's with candidates
    mapping(uint=>Candidate) public candidates;
    //keep track of people that cast their votes
    mapping(address=>bool) public voted;
    //Keeping track of number of candidates
    uint public candidatesCount;

    event Voted(uint indexed _candidateId);

    constructor(){
        candidatesCount=0;
        addCandidate("Candidate 1");
        addCandidate("Candidate 2");
    }

    function addCandidate(string memory _name) private{
        candidatesCount++;
        candidates[candidatesCount]=Candidate(candidatesCount,_name,0);
    }

    function vote(uint _candidateId) public{
        require(!voted[msg.sender]);
        require(_candidateId>0 && _candidateId<=candidatesCount);
        voted[msg.sender]=true;
        candidates[_candidateId].voteCount+=1;
        emit Voted(_candidateId);
    }
}