//app/(backend)/admin/settings/_components/general/SocialLinks.tsx

import { FaFacebook as Facebook, FaInstagram as Instagram, FaTwitter as Twitter, FaYoutube as Youtube, FaLinkedin as Linkedin } from "react-icons/fa";
import { ComponentProps } from "../types";

export default function SocialLinks({ data, updateNestedData }: Omit<ComponentProps, 'handleChange'>) {
    const socialPlatforms = [
        { icon: Facebook, key: 'facebook', label: 'Facebook', name: 'social_facebook' },
        { icon: Instagram, key: 'instagram', label: 'Instagram', name: 'social_instagram' },
        { icon: Twitter, key: 'twitter', label: 'X (Twitter)', name: 'social_twitter' },
        { icon: Youtube, key: 'youtube', label: 'YouTube', name: 'social_youtube' },
        { icon: Linkedin, key: 'linkedin', label: 'LinkedIn', name: 'social_linkedin' },
    ];

    const thClass = "py-[20px] pr-[20px] font-semibold w-full sm:w-[250px] align-top text-left text-[#1d2327] text-[14px]";
    const tdClass = "py-[15px] px-[10px] align-top text-[#3c434a]";
    const inputClass = "w-full max-w-[400px] border border-[#8c8f94] rounded-[3px] pl-9 pr-3 py-1.5 text-[14px] text-[#2c3338] shadow-[inset_0_1px_2px_rgba(0,0,0,0.07)] focus:border-[#2271b1] focus:shadow-[0_0_0_1px_#2271b1] outline-none transition-shadow bg-white";

    return (
        <>
            {socialPlatforms.map((item, index) => (
                <tr key={item.key} className={index === socialPlatforms.length - 1 ? "" : "border-b border-[#f0f0f1]"}>
                    <th className={thClass}>{item.label}</th>
                    <td className={tdClass}>
                        <div className="relative w-full max-w-[400px]">
                            <item.icon size={16} className="absolute left-3 top-2.5 text-[#8c8f94]"/>
                            <input 
                                name={item.name}
                                // Type assertion to let TypeScript know item.key is a valid key for socialLinks
                                value={data.socialLinks[item.key as keyof typeof data.socialLinks]} 
                                onChange={(e) => updateNestedData('socialLinks', item.key, e.target.value)} 
                                placeholder={`${item.label} URL`}
                                className={inputClass}
                            />
                        </div>
                    </td>
                </tr>
            ))}
        </>
    );
}