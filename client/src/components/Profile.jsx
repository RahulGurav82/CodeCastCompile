import React from 'react'

const Profile = ({client}) => {
  return (
    <div className='w-full flex h-12'>
        <div className='w-20 text-black bg-amber-300 rounded-xl flex items-center justify-center'>{client.username[0]}</div>
        <div className='w-full flex items-center ml-2 text-white'>{client.username}</div>
    </div>
  )
}

export default Profile