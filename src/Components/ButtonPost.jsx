
import React, { useEffect, useState } from "react";
import { addDoc, arrayUnion, collection, doc, setDoc } from "firebase/firestore";
import { getStorage, ref, uploadBytes } from "firebase/storage";
import fb from "../FireBase";
import "../Styles/postbutton.scss"

const stor_ref = ref(fb.storage)
const posts_ref = ref(fb.storage, 'posts')


export default function ButtonPost() {

    const [imgStyles, setImgStyles] = useState({
        objectFit: 'contain',
        width: '100%',
        height: '100%',
        transformOrigin: 'center'
    })
    const [imgUploaded, setImgUploaded] = useState()
    
    useEffect(() => {

        document.getElementById('input_pic').onchange = () => {
            let file = document.getElementById('input_pic').files[0]
            if (file.type.includes("image/")) {
                setImgUploaded(file)
            } else {
                alert('Choose an image file.')
            }
        }

        if (imgUploaded) {

            
            let input_image_size = document.getElementById('image_size')
            let input_image_x = document.getElementById('image_x')
            let input_image_y = document.getElementById('image_y')
    
            document.getElementById("template_sliders_id").onchange = () => {
                setImgStyles({
                    objectFit: 'contain',
                    width: `${input_image_size.value}%`,
                    height: `${input_image_size.value}%`,
                    transform: `translate(${input_image_x.value}px, ${input_image_y.value}px)`
                })
            }
        }

    }, [imgUploaded])



    function create_post(e) {

        
        let userref = 'hkkZCP0I1Fml2rdLOAx7'
        let file = document.getElementById('input_pic').files[0]
        let thisRef = ref(posts_ref, file.name)
        let created = new Date
        
        if (file.type.includes("image/")) {
            uploadBytes(thisRef, file)
            .then(res => {
        
                //adiciona o doc do arquivo criado na storage
                addDoc(collection(fb.db, 'posts'), {
                   ref: thisRef.fullPath, 
                   created: created,
                   username: 'luannofe', //TODO: pegar currentuser 
                   desc: 'lorem ipsum',
                   style_obj: imgStyles
                }, {merge: true})
                .then( document => {
                    setDoc(doc(fb.db, 'users', userref),
                    {userBucket: arrayUnion({
                        ref: document.path,
                        date: created
                    })},
                    {merge: true})
                    location.reload()
                    setImgUploaded()
                })
            })
        }
    }

    function cancel_post(e) {
        setImgUploaded()
    }



    return (
        <div className="post_div">
            <span>Send something:</span>
            <div className="input_parent">
                <input id="input_pic" type={'file'} accept="image/png, image/jpg, image/jpeg"></input>
                {imgUploaded &&
                    <div className="send_pic_div">
                        <div className="story_template">
                            <img src={URL.createObjectURL(imgUploaded)} id="pic_template" style={imgStyles} className="pic_template"/>
                        </div>
                        <div className="template_sliders">
                            <form id="template_sliders_id">
                                <label>Image size:</label>
                                <input type="range" min="15" max="250" name="image_size" id="image_size"  />
                                <label>X:</label>
                                <input type="range" min='-424' max='424' name="image_x" id="image_x"/>
                                <label>Y:</label>
                                <input type="range" min='-754' max='754' name='image_y' id='image_y'/>
                            </form>
                            <div className="buttons">
                                <button className="send_button" onClick={create_post}>Send</button>
                                <button className="cancel_button" onClick={cancel_post}>Cancel</button>
                            </div>
                        </div>
                    </div>
                }
            </div>
        </div>
    )
}