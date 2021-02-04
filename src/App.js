import {Howl, Howler} from 'howler';
import React, {useEffect,useRef, useState} from 'react'
import './App.css';
import * as tf from '@tensorflow/tfjs';

import soundURL from './asset/hey_sondn.mp3'
const mobilenet = require('@tensorflow-models/mobilenet');
const knnClassifier = require('@tensorflow-models/knn-classifier');

var sound = new Howl({
  src: [soundURL]
});


const Not_touch_label='not_touch';
const Touched_label = 'Touched';
const Train_time = 50 ;
const touched_confidence =0.7;

// const [touched,setTouched] = useState(false)

function App() {
  const video = useRef();
  const classifier = useRef();
  const mobileModule  = useRef();
  const playFile = useRef(true);

  const init = async() =>{
    console.log('init....');
    await setupCamera();
    alert("Cài đặt camera thành công!! Xin Chờ Trong Vài Giây!!");

    mobileModule.current = await mobilenet.load();
    classifier.current =  knnClassifier.create();
    console.log("Cài đặt các ứng dụng thành công!!");
    alert("Không chạm tay lên mặt. Bấm Không Sờ Lên Mặt");
    
  }

  const setupCamera = () => {
    return new Promise((resolve, reject) => {
        navigator.getUserMedia = navigator.getUserMedia ||
        navigator.webkitGetUserMedia ||
        navigator.mozGetUserMedia ||
        navigator.msGetUserMedia;

        if(navigator.getUserMedia){
          navigator.getUserMedia(
            {video:true},
            stream => {
              video.current.srcObject =stream;
              video.current.addEventListener('loadeddata',resolve);
            },
            error => reject(error)
          );
        }else{
          reject();
        }
    });
  }

  const train = async label =>{
    if(label === Not_touch_label){
      console.log(label + " AI Đang học theo bạn xin Đừng sờ lên mặt!!!!");
    }else{
      console.log(label + " AI Đang học theo bạn Hãy Sờ Lên Măt!!!!");
    }
    
   
    for(let i  = 0; i < Train_time ; ++i){
      console.log("Progress "+ parseInt((i+1)/Train_time*100) +"%")
   
      await training(label);
    }
    if(label === Not_touch_label){
      alert("Xin Mời Bấm Nút Sờ Lên Mặt Và Dạy Cho AI của chúng tôi!!");
    }else{
      alert("Thành Công!!Mời Bấm Nút Chạy Ứng Dụng và Hãy Làm Công Việc Của Bạn <3");
    }
  }

  const sleep = (ms=0) => {
    return new Promise(resolve => setTimeout(resolve,ms))
  }
  
  const training = label => {
    return new Promise(async resolve =>{
      const embedding =  mobileModule.current.infer(
        video.current,
        true
      );
      classifier.current.addExample(embedding,label);
      await sleep(100);
      resolve();
    });
  }

  const run = async () =>{
    const embedding =  mobileModule.current.infer(
      video.current,
      true
    );
    const result = await classifier.current.predictClass(embedding);
    if(result.label === Touched_label && result.confidences[result.label] > touched_confidence){
      console.log('Touched');
      if(playFile.current){
        playFile.current = false;
        sound.play(); 
      }
      // setTouched(true);
     
    }else{
      console.log('Not Touched');
      // setTouched(false);
    }
      
    await sleep(200);
    run();
  }
  useEffect(() => {
    init();
    sound.on('end', function(){
      playFile.current=true;
    });
    return () => {

    }
  },[]);

  return (
    <div className="main">
      <video
      ref={video}
      className="video"
      autoPlay
      />
      <div className="control">
        <button className="btn1" onClick={() => train(Not_touch_label)}>Không Sờ Lên Mặt</button>
        <button className="btn2"  onClick={() => train(Touched_label)}> Sờ Lên Mặt</button>
        <button className="btn3" onClick={() => run()}>Chạy ứng dụng</button>
      </div>
     
    </div>
  );
}

export default App;
