//using Aggregation pipeline

var mongoose = require('mongoose');

//Function returning pipeline to find all queries
var pipelineAll = function(){

    return [
    {$project:{
        _id:0,
        name:1,
        "queries.queryTitle":1,
        "queries.queryDetails":1,
        "queries.ticketStatus":1,
        "queries.createdAt":1,
        "queries.ticketNumber":1
    }},
    {$unwind:"$queries"},
    {$sort:{"queries.createdAt":-1}},
    {$project:{
        ticketNumber:"$queries.ticketNumber",
        ticketStatus:"$queries.ticketStatus",
        name:1,
        title:"$queries.queryTitle",
        details: "$queries.queryDetails",
        createdAt: "$queries.createdAt"
    }}];
}//end

exports.all = pipelineAll();

//Function returning pipeline to find all queries of the current user
exports.currentUser = function(userId){

    return [
    {$match:{"_id": mongoose.Types.ObjectId(userId)}},
    {$project:{
        _id:0,
        name:1,
        "queries.queryTitle":1,
        "queries.queryDetails":1,
        "queries.ticketStatus":1,
        "queries.createdAt":1,
        "queries.ticketNumber":1
    }},
    {$unwind:"$queries"},
    {$sort:{"queries.createdAt":-1}},
    {$project:{
        ticketNumber:"$queries.ticketNumber",
        ticketStatus:"$queries.ticketStatus",
        name:1,
        title:"$queries.queryTitle",
        details: "$queries.queryDetails",
        createdAt: "$queries.createdAt"
    }}];

}//end

//Function returning pipeline to find all open queries of the current user
exports.currentUserOpen = function(userId){

    return [
    {$match:{"_id": mongoose.Types.ObjectId(userId)}},
    {$project:{
        _id:0,
        name:1,
        "queries.queryTitle":1,
        "queries.queryDetails":1,
        "queries.ticketStatus":1,
        "queries.createdAt":1,
        "queries.ticketNumber":1
    }},
    {$unwind:"$queries"},
    {$match: {"queries.ticketStatus":"Open"}},
    {$sort:{"queries.createdAt":-1}},
    {$project:{
        ticketNumber:"$queries.ticketNumber",
        ticketStatus:"$queries.ticketStatus",
        name:1,
        title:"$queries.queryTitle",
        details: "$queries.queryDetails",
        createdAt: "$queries.createdAt"
    }}];

}//end


//Function returning pipeline to find all closed queries of the current user
exports.currentUserClose = function(userId){

    return [
    {$match:{"_id": mongoose.Types.ObjectId(userId)}},
    {$project:{
        _id:0,
        name:1,
        "queries.queryTitle":1,
        "queries.queryDetails":1,
        "queries.ticketStatus":1,
        "queries.createdAt":1,
        "queries.ticketNumber":1
    }},
    {$unwind:"$queries"},
    {$match: {"queries.ticketStatus":"Close"}},
    {$sort:{"queries.createdAt":-1}},
    {$project:{
        ticketNumber:"$queries.ticketNumber",
        ticketStatus:"$queries.ticketStatus",
        name:1,
        title:"$queries.queryTitle",
        details: "$queries.queryDetails",
        createdAt: "$queries.createdAt"
    }}];

}//end

//Function returning pipeline to find selected query
exports.currentQuery = function(ticketNumber){

    return [
    {$unwind: "$queries"},
    {$match:{"queries.ticketNumber": ticketNumber}},
    {$project:{
        _id:0,
        name:1,
        title:"$queries.queryTitle",
        details: "$queries.queryDetails",
        status: "$queries.ticketStatus",
        createdAt: "$queries.createdAt",
        "queries.message":1,
        ticketNumber: "$queries.ticketNumber"
    }}];

}//end
