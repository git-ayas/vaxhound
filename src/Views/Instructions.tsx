import React from 'react'

function Instructions() {
    return (
        <div>
            <h1>How to use</h1>
            <p>
                <ol>
                    <li>Login to you CoWin account.</li>
                    <li>Select your beneficiaries</li>
                    <li>Go to search page.</li>
                    <li>Open the plugin and select state and districts.</li>
                    <li>Select poll button.</li>
                    <li>
                        <p>The plugin will now run in the background searching for available vaccination centers.
                            Once a center is found, booking screen is automatically populated.
                            Be sure to quickly select the slot and fill in the captcha before slots are booked
                        </p>
                    </li>
                </ol>

            </p>
        </div>
    )
}

export default Instructions
