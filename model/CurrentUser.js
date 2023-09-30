const mongoose = require('mongoose');
const {Schema} = mongoose;


const currentUserSchema = new Schema({
    user:{ type: Schema.Types.ObjectId, ref: 'User', required: true},
    role:{type:String,required:true}
})

const virtual  = currentUserSchema.virtual('id');
virtual.get(function(){
    return this._id;
})
currentUserSchema.set('toJSON',{
    virtuals: true,
    versionKey: false,
    transform: function (doc,ret) { delete ret._id}
})


exports.CurrentUser = mongoose.model('CurrentUser',currentUserSchema);