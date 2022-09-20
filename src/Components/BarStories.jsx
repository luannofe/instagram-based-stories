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
        ////console.log('renderizou')
        if (loadedPosts.length == 0) {
            (async () => {
                //console.log('oi')
  
                return setLoadedPosts( await get_posts())
            })()
        } else {
            setSelectedStoryPar(0)
            //console.log('load posts use effect')
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
            //console.log('pausou, paused: ', pausedBuffer)
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

            //console.log(document.getElementById('stories_bar_div'))
            let pause_bt_id = 'story_' + selectedStoryPar + '_pause_button'
            document.getElementById(pause_bt_id).onclick = () => {
                pausedBuffer = !pausedBuffer
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
            //console.log(bool)

            let newSelectedStory = selectedStory + bool

            if ((newSelectedStory < 0) || (newSelectedStory >= loadedPosts.length)) {
                return;
            }

            selectedStory = newSelectedStory
            //console.log(`next story (${newSelectedStory})`)
            setSelectedStoryPar(newSelectedStory)

            for (let post in loadedPosts) {
                let id_acessor = 'story_' + loadedPosts[post].screenId
                let story_dom = document.getElementById(id_acessor)

                if (post != selectedStory) {

                    let storyoffset = ((window.innerWidth/2) - (story_size.scaledWidth)/2) 
                    let storyoffset_order = ((story_size.width) * (post - selectedStory))
                    let transform_string = `translate(${storyoffset + storyoffset_order}px,0) scale(0.65)`
                    ////console.log(`Next post, TRANSFORM STRING: ${transform_string}`)
                    storyoffset_order < 0 ? story_dom.style.transformOrigin = '-50%' : story_dom.style.transformOrigin = '50%'
                    story_dom.style.transform = transform_string
                    
                } else {

                    let storyoffset = ((window.innerWidth/2) - (story_size.width)/2)
                    story_dom.style.transform = "translate(+"+ String(storyoffset)+"px,0)"
                    ////console.log(`Story initial x: ${storyoffset}, story width: ${story_size.width} , middle screen: ${window.innerWidth/2}`)
                }
            }
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

        //story
        story_selector_div.style.transform = "translate(+"+ String(selector_offset)+"px,0)"
        //left button
        story_previous_button.style.transform = "translate(+"+ String(selector_offset - story_previous_button.offsetWidth - 4)+"px, " + String(vertical_offset - 44) + "px)"
        //right button
        story_next_button.style.transform = "translate(+"+ String(button_offset)+"px, " + String(vertical_offset - (44)) + "px)"


        ////console.log('ORGANIZING...')
        //sort stories
        if (stories_bar_div.clientWidth > 600) {
            for (let post in loadedPosts) {
                let id_acessor = 'story_' + loadedPosts[post].screenId
                let story_dom = document.getElementById(id_acessor)
                
                if (post != selectedStory) {
        
                    let storyoffset = ((stories_bar_div.clientWidth/2) - (story_size.scaledWidth)/2) 
                    let storyoffset_order = ((story_size.width) * (post - selectedStory))
                    let transform_string = "translate("+ String(storyoffset + storyoffset_order)+"px,0) scale(0.65)"
                    story_dom.style.transform = transform_string
                    ////console.log(`Story initial x: ${storyoffset}, story offset: ${storyoffset_order}, story width: ${story_size.scaledWidth} , middle screen: ${window.innerWidth/2}, TRANSFORM STRING: ${transform_string}`)
                } else {
        
                    let storyoffset = ((stories_bar_div.clientWidth/2) - (story_size.width)/2)
                    story_dom.style.transform = "translate("+ String(storyoffset)+"px,0)"
                    ////console.log(`selected, story initial x: ${storyoffset}, story width: ${story_size.width} , middle screen: ${window.innerWidth/2}`)
                }
            }
        } else {
            for (let post in loadedPosts) {
                let id_acessor = 'story_' + loadedPosts[post].screenId
                let story_dom = document.getElementById(id_acessor)
                
                if (post == selectedStory) {
                    story_dom.style.transform = "translate(0,0)"
                } else {
                    let storyoffset_order = ((stories_bar_div.clientWidth) * (post - selectedStory)) 
                    story_dom.style.transform = "translate("+ String(storyoffset_order)+"px,0)"
                }
            }
        }
        ////console.log('ENDED ORGANIZING...')
        
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
