
const specs = [
  { label: 'What\'s in the Box', value: '1 x GoBike 12 E-Bike' }, // "Bike"
  { label: 'Battery Included', value: '1 x 36V 5.0Ah Quick-Swap Battery' }, // "Battery"
  { label: 'Charger Included', value: '1 x AU-Spec Fast Charger' }, // "Charger"
  { label: 'Customise Your Ride', value: '7 x Different Colour Sticker Kits' }, // "7 Different colour sticker kits!"
  { label: 'Race Ready', value: '1 x Official GoBike Number Plate' }, // "Number Plate"
  { label: 'Bonus Swag', value: '1 x FREE Official GoBike T-Shirt' }, // "Tshirt"
  { label: 'Get Started Kit', value: 'Assembly Toolkit & User Guide' }, // "Toolkit" & "User Guide"
];
export default function WhatsInTheBox() {
  return (
    // .specTableContainer replaced
    <div className="flex flex-col">
      {specs.map(spec => (
        // .specRow replaced
        <div key={spec.label} className="grid grid-cols-[30%_1fr] gap-4 items-center py-2.5 border-b border-[#eeeeee] font-sans text-base last:border-b-0">
          {/* .specLabel replaced */}
          <span className="font-bold text-black text-left">{spec.label}:</span>
          {/* .specValue replaced */}
          <span className="font-semibold text-black text-left">{spec.value}</span>
        </div>
      ))}
    </div>
  );
}