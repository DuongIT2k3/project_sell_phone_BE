import mongoose from "mongoose";
import {DB_URI} from './environments.js'


function connectDB(){
    mongoose.connect(DB_URI)
    .then(() => {
      console.log("Kết nối thành công");
    })
    .catch((error) => {
      console.error("Lỗi kết nối ", error)
    })
}
export default connectDB;