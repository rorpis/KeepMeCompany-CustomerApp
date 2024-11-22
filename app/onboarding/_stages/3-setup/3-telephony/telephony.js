import { ActiveButton } from '@/app/_components/global_components';

export function Telephony({ data = {}, updateData }) {
  return (
    <div className="w-full max-w-3xl mx-auto flex flex-col gap-8">
      {/* Timeline Options */}
      <div className="relative w-full pt-8 pb-16">
        {/* Text Options */}
        <div className="grid grid-cols-3 gap-x-4">
          <div className="text-center mx-auto w-[80%] italic">
            "If you would like to skip the queue and speak with an AI and please press 1"
          </div>
          <div className="text-center mx-auto w-[80%] italic">
            "If you would prefer to speak with a receptionist press 2"
          </div>
          <div className="text-center mx-auto w-[80%] italic">
            ...(other options)
          </div>
        </div>

        {/* Timeline Bar */}
        <div className="absolute left-0 right-0 h-3.5 bg-gray-700 top-[50%] translate-y-[1.6rem] rounded-full border-2 border-white" />

        {/* Circles */} 
        <div className="grid grid-cols-3 gap-x-4 translate-y-[15%] justify-center relative z-10">
          <div className="flex flex-col items-center group relative">
            <div className="w-16 h-16 rounded-full bg-gray-700 border-2 border-white text-white flex items-center justify-center text-lg font-bold">
              1
            </div>
          </div>
          <div className="flex flex-col items-center">
            <div className="w-16 h-16 rounded-full bg-gray-700 border-2 border-white text-white flex items-center justify-center text-lg font-bold">
              2
            </div>
          </div>
          <div className="flex flex-col items-center">
            <div className="w-16 h-16 rounded-full bg-gray-700 border-2 border-white text-white flex items-center justify-center text-lg font-bold">
              3
            </div>
          </div>
        </div>
      </div>

      {/* Setup Instructions */}
      <div className="text-center">
        To set this up please call +44 5066 0811 for Surgery Connect,<br/> +44 5066 0811 for XYZ. Our redirection number is +44 5066 0811.
      </div>

      {/* Already Called Button */}
      <div className="flex justify-center">
        <ActiveButton onClick={() => console.log('Already called')}>
          Already Called
        </ActiveButton>
      </div>
    </div>
  );
}