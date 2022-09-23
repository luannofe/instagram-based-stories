import React, { useEffect, useState } from "react";
import fb from "../FireBase";
import { addDoc, arrayUnion, collection, doc, getDoc, getDocs, setDoc } from "firebase/firestore";
import Story from "./Story";
import '../Styles/storiesBar.scss'
import { getDownloadURL, ref } from "firebase/storage";





export default function BarStories(props) {
    
    let duration = 16
    let timer = duration

    const [loadedPosts, setLoadedPosts] = useState([])
    const [selectedStoryPar, setSelectedStoryPar] = useState()
    const [paused, setPaused] = useState(false)
    const [timerBuffer, setTimerBuffer] = useState(duration)

    let selectedStory = 0
    let pausedBuffer = false
    let timerInterval;
   

    const story_size = {height: 754, width: 424, scaledWidth: 275.6}
    

    //load stories 
    useEffect(() => {

        //touch to next story func
        document.getElementById('story_selector').onclick = (e) => {

            const story_previous_button = document.getElementById('previous_story_button')
            const story_next_button = document.getElementById('next_story_button')

            if (window.innerWidth <= 600 && loadedPosts.length > 0) {
                if (e.clientX > window.innerWidth/2) {
                    story_next_button.click()
                } else {
                    story_previous_button.click()
                }
            }
        }

        if (loadedPosts.length == 0) {
            (async () => {
  
                return setLoadedPosts( await get_posts())
            })()
        } else {


            setSelectedStoryPar(0)
            organize()


        } 

    }, [loadedPosts])
    
    //define a localização do selector de storys e seus buttons, assim como suas funções
    useEffect(() => {

        organize()
        const story_previous_button = document.getElementById('previous_story_button')
        const story_next_button = document.getElementById('next_story_button')

        //listeners
        story_next_button.onclick = nextStory(1)
        story_previous_button.onclick = nextStory(-1)
        
    }, [loadedPosts])

    useEffect(() => {
        window.onresize = organize
    }, [loadedPosts])

    
    useEffect(() => {
        if (paused) {
            pausedBuffer = true
        }

    }, [paused])
   
    useEffect(() => {
        if (selectedStoryPar >= 0) {
            timerInterval = setInterval(() => {
                if (timer <= 0) {
                    clearInterval(timerInterval)
                    document.getElementById('next_story_button').click()
                    return
                }
                
                !pausedBuffer? timer -= 0.1 : ""
                setTimerBuffer(timer)
        
            }, 100)

            document.getElementById('next_story_button').addEventListener(('click'), () => {
                clearInterval(timerInterval)
            })

            document.getElementById('previous_story_button').addEventListener(('click'), () => {
                clearInterval(timerInterval)
            })

            let pause_bt_id = 'story_' + selectedStoryPar + '_pause_button'
            document.getElementById(pause_bt_id).onclick = () => {
                pausedBuffer = !pausedBuffer
            }
            return () => { 

                clearInterval(timerInterval)
            }
        }

        
    }, [selectedStoryPar])




    return (
        <>
            <div className="stories_bar" id="stories_bar_div">
                <button className="story_navigator_button" id="previous_story_button">{"<"}</button>
                <div id="story_selector" className="story_selector"></div>
                <button className="story_navigator_button" id="next_story_button">{">"}</button>
                {loadedPosts.map((post) => {
                    return (<Story key={post.screenId} dataObj={post} funcs={{selectedStoryPar, duration, timerBuffer, paused, setPaused}}/>)
                })}
            </div>
        </>
    ) 
    
    
    function nextStory(bool) {

        return e => {

            let newSelectedStory = selectedStory + bool

            if ((newSelectedStory < 0) || (newSelectedStory >= loadedPosts.length)) {
                return;
            }

            selectedStory = newSelectedStory
            setSelectedStoryPar(newSelectedStory)

            organize()
        }
    }

    function organize() {

        let stories_bar_div = document.getElementById('stories_bar_div')
        const story_selector_div = document.getElementById('story_selector')
        const story_previous_button = document.getElementById('previous_story_button')
        const story_next_button = document.getElementById('next_story_button')


        let selector_offset = (window.innerWidth/2) - story_size.width/2
        let button_offset = ((window.innerWidth/2) + story_size.width/2) + 4
        let vertical_offset = (stories_bar_div.clientHeight/2)




        //sort stories
        if (stories_bar_div.clientWidth > 600) {

            //story
            story_selector_div.style.transform = `translate(${selector_offset}px,0px)`
            //left button                              
            story_previous_button.style.transform = `translate(${(selector_offset - story_previous_button.offsetWidth - 4)}px, ${(vertical_offset - 44)}px)`
            //right button
            story_next_button.style.transform = `translate(${button_offset}px, ${(vertical_offset - 44)}px)`


            for (let post in loadedPosts) {
                let id_acessor = 'story_' + loadedPosts[post].screenId
                let story_dom = document.getElementById(id_acessor)
                
                if (post != selectedStory) {
        
                    let storyoffset = ((stories_bar_div.clientWidth/2) - (story_size.scaledWidth)/2) 

                    let storyoffset_order = ((story_size.width) * (post - selectedStory))
                    story_dom.style.transform = `translate( ${storyoffset+ storyoffset_order}px, 0) scale(0.65)`
                } else {
        
                    let storyoffset = ((stories_bar_div.clientWidth/2) - (story_size.width)/2)
                    story_dom.style.transform = "translate("+ String(storyoffset)+"px,0)"
                }
            }
        } else {

            story_selector_div.style.transform = "translate(0px,0)"

            for (let post in loadedPosts) {
                let id_acessor = 'story_' + loadedPosts[post].screenId
                let story_dom = document.getElementById(id_acessor)
                
                if (post == selectedStory) {
                    story_dom.style.transform = "translate(0,0)"
                } else {
                    let storyoffset_order = ((stories_bar_div.clientWidth) * (post - selectedStory)) 
                    story_dom.style.transform = `translate(${storyoffset_order}px, 0px)`
                }
            }
        }
        
    }

    
}


//component functions:



//return filtered array
function filter_docs_data(docs) {
    let i = 0
    let arr = []

    return new Promise((resolve, reject) => {

        docs.forEach(post => {
            arr = [...arr, post.data()]
            i ++
            docs.docs.length == i? resolve(arr) : ""
        })

    })
}

function create_user(e) {
    addDoc(collection(fb.db, 'users'), {
        username: 'luannofe',
        displayName: 'Luan Nobrega',
        email: 'nobregaluanf@gmail.com',
        userBucket: [],
    })
}

//return posts filtered with media 
async function get_posts() {

    let docs = await getDocs(collection(fb.db, 'posts'))
    let docs_data = await filter_docs_data(docs)
    let docs_data_media = []

    return new Promise((resolve, reject) => {
        let i = 0
        //add media to each post in array
        docs_data.forEach(async post => {
            await getDownloadURL(ref(fb.storage, post.ref)).then( res => {
                let obj = {
                    ...post,
                    media_url: res,
                    screenId: i,  
                }
                docs_data_media = [...docs_data_media, obj]
                i ++
            })
            i == docs_data.length? resolve(docs_data_media) : ""
        })
    })
    
}
