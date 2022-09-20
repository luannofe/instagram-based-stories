import { documentId } from "firebase/firestore";
import { set } from "lodash";
import { func } from "prop-types";
import React, { useEffect, useState } from "react";
import '../Styles/story.scss'

export default function Story({dataObj, funcs}) {

    const [selected, setSelected] = useState(false)
    const [paused, setPaused] = useState(false)

    let thisId = 'story_' + dataObj.screenId
    let divs_id = {
        cover: thisId + '_story_cover',
        upper_gui: thisId + '_upper_gui',
        bottom_gui: thisId + '_bottom_gui',
        timer: {
            pause_button: thisId + '_pause_button',
            progress_line: thisId + '_progress_line'
        }
    }

    let storyTime = 'un';
    if (dataObj.created != 'un') {
        let postTime = new Date(dataObj.created.toDate())
        let now = new Date()
        let postHour = new Date(now - postTime).getUTCHours()
        if (postHour == 0) {
            storyTime = 'Now'
        } else {
            storyTime = `${postHour}H` 
        }
        
    }

    //checa se este story está sendo visualizado
    useEffect(() => {
        funcs.selectedStoryPar == dataObj.screenId? setSelected(true) : setSelected(false)
    }, [funcs.selectedStoryPar])

    //css
    useEffect(() => {
        selectedStyles()

 
    }, [selected])

    useEffect(() => {
        let btn = document.getElementById(divs_id.timer.pause_button)

        btn.addEventListener('click', (e) => {
            setPaused(!paused)
        })

        !paused? btn.style.backgroundImage = "url(pause.png)" : btn.style.backgroundImage = "url(play.png)"
    }, [paused])

    //timer
    useEffect(() => {
        if (selected) {
            //sets the progression bar width
            let progressBarDiv = document.getElementById(divs_id.timer.progress_line)
            let progressBarWidth = ( (funcs.timerBuffer / funcs.duration) * 100)
            progressBarDiv.style.width = `${progressBarWidth}%`
        }

    }, [funcs.timerBuffer])

    return (
        <>        
            <div className="story_container" id={thisId}>
                <div className="story_cover" id={divs_id.cover}>
                    <img src="logo192.png"></img>
                    <a>{dataObj.username}</a>
                    <span>{storyTime}</span>      
                </div>
                <div className="story_upper_gui" id={divs_id.upper_gui}>
                    <div className="timer">
                        <div className="line">
                            <div className="progress_line" id={divs_id.timer.progress_line}></div>
                        </div>
                    </div>
                    <div className="after_line">
                        <div className="story_header">
                            <img src="logo192.png"></img>
                            <a>{dataObj.username}</a>
                            <span>{storyTime}</span>
                        </div>
                        <div className="story_functions">
                            <button className="pause_button" id={divs_id.timer.pause_button}></button>
                        </div>
                    </div>
                </div>
                <div className="story_media">
                    <img id='story_media_img' draggable style={dataObj.style_obj} src={dataObj.media_url}/>
                </div>
                <div className="story_bottom_gui" id={divs_id.bottom_gui}>
                    <div className="story_bottom_opt">
                        <div contentEditable suppressContentEditableWarning className="story_bottom_answer">
                            Responder a {dataObj.username}
                        </div>
                        <button>A</button>
                        <button>B</button>
                    </div>
                </div>
            </div>
        </>
    )



    function selectedStyles() {
        let cover = document.getElementById(divs_id.cover)
        let upper_gui = document.getElementById(divs_id.upper_gui)
        let bottom_gui = document.getElementById(divs_id.bottom_gui)
        let btn = document.getElementById(divs_id.timer.pause_button)

        if (selected) {
            cover.style.display = 'none'
            upper_gui.style.display = 'flex'
            bottom_gui.style.display = 'flex'
            btn.style.backgroundImage = "url(pause.png)"
        } else {
            cover.style.display = 'flex'
            upper_gui.style.display = 'none'
            bottom_gui.style.display = 'none'
        }
    }


}
