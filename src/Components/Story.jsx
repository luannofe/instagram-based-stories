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
                    <img src="logo512.png"></img>
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
                            <img src="logo512.png"></img>
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
                        <svg aria-label="Curtir" className="like_button" color="#ffffff" fill="#ffffff" height="24" role="img" viewBox="0 0 24 24" width="24"><path d="M16.792 3.904A4.989 4.989 0 0121.5 9.122c0 3.072-2.652 4.959-5.197 7.222-2.512 2.243-3.865 3.469-4.303 3.752-.477-.309-2.143-1.823-4.303-3.752C5.141 14.072 2.5 12.167 2.5 9.122a4.989 4.989 0 014.708-5.218 4.21 4.21 0 013.675 1.941c.84 1.175.98 1.763 1.12 1.763s.278-.588 1.11-1.766a4.17 4.17 0 013.679-1.938m0-2a6.04 6.04 0 00-4.797 2.127 6.052 6.052 0 00-4.787-2.127A6.985 6.985 0 00.5 9.122c0 3.61 2.55 5.827 5.015 7.97.283.246.569.494.853.747l1.027.918a44.998 44.998 0 003.518 3.018 2 2 0 002.174 0 45.263 45.263 0 003.626-3.115l.922-.824c.293-.26.59-.519.885-.774 2.334-2.025 4.98-4.32 4.98-7.94a6.985 6.985 0 00-6.708-7.218z"></path></svg>
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
