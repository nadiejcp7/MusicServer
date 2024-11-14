#!/usr/bin/env python
# coding: utf-8

# In[1]:


import asyncio
import websockets
import yt_dlp
import urllib.request
import re
import pandas as pd
import vlc
import time
import threading
import os


# In[2]:


class Player():

    def __init__(self):  
        self.media = vlc.MediaPlayer()
        self.playing = False
        self.pause = False
        self.songs = []
        self.pos = 0

    def download_audio(self, yt_url):
        ydl_opts = {
            'format': 'bestaudio/best',
            'outtmpl': '/path/to/folder/%(title)s.%(ext)s',  # Initial template
        }
        
        with yt_dlp.YoutubeDL(ydl_opts) as ydl:
            info_dict = ydl.extract_info(yt_url, download=False)  # Extract info without downloading
            nombre = re.sub('[^A-Za-z0-9]+', '', info_dict['title'])
            ruta = 'C:/Users/jairo/Music/Downloaded/' + nombre + '.m4a'
            ydl.params['outtmpl'] = f"{ruta}"  
            with yt_dlp.YoutubeDL(ydl_opts) as ydl_custom:
                ydl_custom.download([yt_url])
            return info_dict['title'], info_dict['id'], ruta

    def addSong(self, name):
        url = 'https://www.youtube.com/results?search_query='
        if name.startswith("https://"):
            url = name
        else:
            x = name.split(" ")
            url += x[0]
            for i in range(1, len(x)):
                url += '+' + x[i]

            html = urllib.request.urlopen(url)
            code = re.findall(r"watch\?v=(\S{11})", html.read().decode())[0]
            url = "https://www.youtube.com/watch?v=" + code

        nombre, code, ruta = self.download_audio(url)
        self.songs.append([ruta, nombre, code])
        print('Playing', self.playing)
        if not(self.playing):
            song_thread = threading.Thread(target=self.play)
            song_thread.start()
            return nombre, code
        return '', ''

    def play(self):
        self.playing = True
        self.pause = False
        if self.pos<0:
            self.pos = len(self.songs)-1
        elif self.pos>=len(self.songs):
            self.pos = 0

        while self.pos < len(self.songs):
            self.media = vlc.MediaPlayer(self.songs[self.pos][0])
            self.media.play()
            time.sleep(2)
            while((self.media.is_playing() != 0) | (self.pause)):
                time.sleep(2)
            self.pos = self.pos + 1
        self.media.stop()
        self.playing = False
        self.pause = False

    def pausar(self):
        if self.playing:
            self.playing = False
            self.pause = True
            self.media.pause()

    def resume(self):
        if self.pause:
            self.playing = True
            self.pause = False
            self.media.play()

    def nextSong(self):
        if (self.playing) | (self.pause):
            if self.pos+1>=len(self.songs):
                self.pos = -1 
            data = self.songs[self.pos+1]
            response = data[1] + '_' + data[2]
            self.media.stop()
            return response
        return 'None'

    def previousSong(self):
        if (self.playing) | (self.pause):
            pos1 = self.pos-1
            if pos1 < 0:
                pos1 = len(self.songs)-1
            data = self.songs[pos1]
            response = data[1] + '_' + data[2]
            print(data)
            self.pos -= 2
            self.media.stop()
            return response
        return 'None'
        
    def paused(self):
        return self.pause;
    
    def name(self):
        data = self.songs[self.pos]
        return data[1] + "_" + data[2]
    
    def isPlaying(self):
        return self.media.is_playing() == 1


# In[3]:


reproductor = Player();
    
async def handle_connection(websocket, path):
    try:
        async for message in websocket:
            print(f"Received from client: {message}")
            if message == 'PlayPause':
                if reproductor.isPlaying() | reproductor.paused():
                    if reproductor.paused():
                        reproductor.resume()
                        await websocket.send('0')
                    else:
                        reproductor.pausar()
                        await websocket.send('1')
            elif message == 'Next':
                await websocket.send(reproductor.nextSong())
            elif message == 'Previous':
                await websocket.send(reproductor.previousSong())
            elif message == 'name':
                await websocket.send(reproductor.name() + '_' + str(reproductor.paused()))
            else:
                nombre, code = reproductor.addSong(message)
                if nombre != '':
                    response = nombre + '_' + code
                    await websocket.send(response)
    except websockets.exceptions.ConnectionClosed as e:
        print(e)
        print("Client disconnected")

async def main():
    server = await websockets.serve(handle_connection, 'localhost', 8080)
    print("Server listening on ws://localhost:8080")
    await server.wait_closed()


# In[ ]:


await main()

